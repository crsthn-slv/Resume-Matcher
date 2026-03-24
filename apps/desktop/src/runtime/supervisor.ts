import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';

import { DESKTOP_BACKEND_ORIGIN, DESKTOP_FRONTEND_ORIGIN, DESKTOP_HEALTH_PATH } from '../config';
import type {
  DesktopBootstrapPhase,
  DesktopBootstrapState,
  DesktopStartupStep,
} from '../shared/contracts';
import { createRuntimeCommands, type RuntimeMode } from './command-factory';
import { appendHostLog, getLogSet } from './logging';
import { killProcessTree, type KillProcessTreeOptions } from './process-tree';

type SpawnFn = typeof spawn;
type ProbeFn = (url: string) => Promise<boolean>;

export interface RuntimeSupervisorOptions {
  mode: RuntimeMode;
  spawnImpl?: SpawnFn;
  probeImpl?: ProbeFn;
  retries?: number;
  intervalMs?: number;
  killProcessTreeImpl?: (options: KillProcessTreeOptions) => Promise<void>;
}

export interface RuntimeSupervisor {
  getState(): DesktopBootstrapState;
  onStateChange(listener: (state: DesktopBootstrapState) => void): () => void;
  start(): Promise<DesktopBootstrapState>;
  stop(): Promise<void>;
  retry(): Promise<DesktopBootstrapState>;
}

const DEFAULT_RETRIES = 30;
const DEFAULT_INTERVAL_MS = 1000;

function defaultProbe(url: string): Promise<boolean> {
  return fetch(url)
    .then((response) => response.ok)
    .catch(() => false);
}

function createState(
  stage: DesktopBootstrapPhase,
  step: DesktopStartupStep,
  message: string,
  logDirectory: string | null,
  url: string | null = null,
  error?: string
): DesktopBootstrapState {
  if (stage === 'failed') {
    return { stage, step, message, logDirectory, url, error: error ?? message };
  }
  if (stage === 'ready') {
    return { stage, step, message, logDirectory, url: url ?? DESKTOP_FRONTEND_ORIGIN };
  }
  if (stage === 'stopping') {
    return { stage, step, message, logDirectory, url };
  }
  return { stage, step, message, logDirectory, url };
}

async function waitForProbe(
  probe: ProbeFn,
  url: string,
  retries: number,
  intervalMs: number
): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    if (await probe(url)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

export function createRuntimeSupervisor(options: RuntimeSupervisorOptions): RuntimeSupervisor {
  const spawnImpl = options.spawnImpl ?? spawn;
  const probeImpl = options.probeImpl ?? defaultProbe;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const killProcessTreeImpl = options.killProcessTreeImpl ?? killProcessTree;
  const listeners = new Set<(state: DesktopBootstrapState) => void>();
  const logs = getLogSet();
  const commands = createRuntimeCommands(options.mode);

  let backend: ChildProcess | null = null;
  let frontend: ChildProcess | null = null;
  let stopping = false;
  let state = createState('starting', 'booting', 'Starting Resume Matcher...', logs.directory);

  const emit = (next: DesktopBootstrapState) => {
    state = next;
    appendHostLog(`${next.stage}:${next.step}:${next.message}`);
    for (const listener of listeners) {
      listener(next);
    }
  };

  const attachLogging = (child: ChildProcess, logFile: string) => {
    const stream = fs.createWriteStream(logFile, { flags: 'a' });
    child.stdout?.pipe(stream);
    child.stderr?.pipe(stream);
  };

  const startChild = (kind: 'backend' | 'frontend') => {
    const config = commands[kind];
    const child = spawnImpl(config.command, config.args, {
      cwd: config.cwd,
      env: config.env,
      windowsHide: true,
      stdio: 'pipe',
    });

    attachLogging(child, kind === 'backend' ? logs.backendLog : logs.frontendLog);
    child.once('exit', (code) => {
      if (!stopping && state.stage !== 'failed') {
        emit(
          createState(
            'failed',
            kind === 'backend' ? 'waiting-backend' : 'waiting-frontend',
            `${kind} exited unexpectedly`,
            logs.directory,
            null,
            `${kind} exited with code ${code ?? 'unknown'}`
          )
        );
      }
    });

    return child;
  };

  const stopChild = async (child: ChildProcess | null) => {
    if (!child?.pid) {
      return;
    }
    await killProcessTreeImpl({ pid: child.pid });
  };

  return {
    getState() {
      return state;
    },
    onStateChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async start() {
      stopping = false;
      emit(createState('starting', 'starting-backend', 'Starting backend...', logs.directory));
      backend = startChild('backend');

      emit(createState('starting', 'waiting-backend', 'Waiting for backend...', logs.directory));
      const backendReady = await waitForProbe(
        probeImpl,
        `${DESKTOP_BACKEND_ORIGIN}${DESKTOP_HEALTH_PATH}`,
        retries,
        intervalMs
      );

      if (!backendReady) {
        emit(
          createState(
            'failed',
            'waiting-backend',
            'Backend did not become ready in time.',
            logs.directory,
            null,
            'Backend health probe timed out.'
          )
        );
        await this.stop();
        return state;
      }

      emit(createState('starting', 'starting-frontend', 'Starting frontend...', logs.directory));
      frontend = startChild('frontend');

      emit(createState('starting', 'waiting-frontend', 'Waiting for frontend...', logs.directory));
      const frontendReady = await waitForProbe(
        probeImpl,
        DESKTOP_FRONTEND_ORIGIN,
        retries,
        intervalMs
      );

      if (!frontendReady) {
        emit(
          createState(
            'failed',
            'waiting-frontend',
            'Frontend did not become ready in time.',
            logs.directory,
            null,
            'Frontend probe timed out.'
          )
        );
        await this.stop();
        return state;
      }

      emit(
        createState(
          'ready',
          'opening-window',
          'Opening Resume Matcher...',
          logs.directory,
          DESKTOP_FRONTEND_ORIGIN
        )
      );
      return state;
    },
    async stop() {
      stopping = true;
      if (state.stage !== 'failed') {
        emit(createState('stopping', 'opening-window', 'Stopping Resume Matcher...', logs.directory));
      }
      await stopChild(frontend);
      await stopChild(backend);
      frontend = null;
      backend = null;
    },
    async retry() {
      await this.stop();
      return this.start();
    },
  };
}
