import path from 'node:path';

import {
  DESKTOP_BACKEND_ORIGIN,
  DESKTOP_BACKEND_PORT,
  DESKTOP_FRONTEND_PORT,
} from '../config';

export type RuntimeMode = 'development' | 'production';

export interface RuntimeCommand {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}

export interface RuntimeCommands {
  backend: RuntimeCommand;
  frontend: RuntimeCommand;
}

function resolveRootDir(): string {
  return path.resolve(__dirname, '../../../..');
}

function baseEnv(mode: RuntimeMode): NodeJS.ProcessEnv {
  return {
    ...process.env,
    BACKEND_ORIGIN: DESKTOP_BACKEND_ORIGIN,
    NEXT_PUBLIC_API_URL: '/',
    PYTHONUNBUFFERED: '1',
    ...(mode === 'production' ? { NODE_ENV: 'production' } : {}),
  };
}

export function createRuntimeCommands(mode: RuntimeMode): RuntimeCommands {
  const rootDir = resolveRootDir();
  const backendCwd = path.join(rootDir, 'apps/backend');
  const frontendCwd = path.join(rootDir, 'apps/frontend');
  const env = baseEnv(mode);

  const backend =
    mode === 'development'
      ? {
          command: 'uv',
          args: [
            'run',
            'uvicorn',
            'app.main:app',
            '--host',
            '127.0.0.1',
            '--port',
            String(DESKTOP_BACKEND_PORT),
            '--log-level',
            'info',
          ],
          cwd: backendCwd,
          env,
        }
      : {
          command: 'python',
          args: [
            '-m',
            'uvicorn',
            'app.main:app',
            '--host',
            '127.0.0.1',
            '--port',
            String(DESKTOP_BACKEND_PORT),
            '--log-level',
            'info',
          ],
          cwd: backendCwd,
          env,
        };

  const frontend =
    mode === 'development'
      ? {
          command: 'npm',
          args: [
            'run',
            'dev',
            '--',
            '--hostname',
            '127.0.0.1',
            '--port',
            String(DESKTOP_FRONTEND_PORT),
          ],
          cwd: frontendCwd,
          env,
        }
      : {
          command: 'npm',
          args: [
            'run',
            'start',
            '--',
            '--hostname',
            '127.0.0.1',
            '--port',
            String(DESKTOP_FRONTEND_PORT),
          ],
          cwd: frontendCwd,
          env,
        };

  return { backend, frontend };
}
