import path from 'node:path';

import {
  DESKTOP_BACKEND_ORIGIN,
  DESKTOP_BACKEND_PORT,
  DESKTOP_FRONTEND_PORT,
} from '../config';
import { resolvePackagedRuntimeLayout } from './packaged-layout';

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

export interface RuntimeCommandFactoryOptions {
  runtimeRoot?: string;
  dataDir?: string;
  backupDir?: string;
}

function resolveRootDir(): string {
  return path.resolve(__dirname, '../../../..');
}

function resolveDefaultDataDir(rootDir: string): string {
  return path.join(rootDir, 'apps/backend/data');
}

function resolveDefaultBackupDir(dataDir: string): string {
  return path.join(dataDir, 'backups');
}

function baseEnv(
  mode: RuntimeMode,
  rootDir: string,
  options: RuntimeCommandFactoryOptions,
): NodeJS.ProcessEnv {
  const dataDir = options.dataDir ?? resolveDefaultDataDir(rootDir);
  const backupDir = options.backupDir ?? resolveDefaultBackupDir(dataDir);

  return {
    ...process.env,
    BACKEND_ORIGIN: DESKTOP_BACKEND_ORIGIN,
    NEXT_PUBLIC_API_URL: '/',
    PYTHONUNBUFFERED: '1',
    RM_DATA_DIR: dataDir,
    RM_BACKUP_DIR: backupDir,
    ...(mode === 'production' ? { NODE_ENV: 'production' } : {}),
  };
}

export function createRuntimeCommands(
  mode: RuntimeMode,
  options: RuntimeCommandFactoryOptions = {},
): RuntimeCommands {
  const rootDir = resolveRootDir();
  const backendCwd = path.join(rootDir, 'apps/backend');
  const frontendCwd = path.join(rootDir, 'apps/frontend');
  const env = baseEnv(mode, rootDir, options);

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
          ...(() => {
            const runtimeRoot = options.runtimeRoot ?? path.join(rootDir, 'dist/desktop');
            const layout = resolvePackagedRuntimeLayout(runtimeRoot);
            return {
              command: layout.backendExecutable,
              args: [],
              cwd: path.dirname(layout.backendExecutable),
              env: {
                ...env,
                PLAYWRIGHT_BROWSERS_PATH: layout.playwrightBrowsersDir,
              },
            };
          })(),
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
          ...(() => {
            const runtimeRoot = options.runtimeRoot ?? path.join(rootDir, 'dist/desktop');
            const layout = resolvePackagedRuntimeLayout(runtimeRoot);
            return {
              command: layout.nodeExecutable,
              args: [layout.frontendServer],
              cwd: path.dirname(layout.frontendServer),
              env: {
                ...env,
                HOSTNAME: '127.0.0.1',
                PORT: String(DESKTOP_FRONTEND_PORT),
                PLAYWRIGHT_BROWSERS_PATH: layout.playwrightBrowsersDir,
              },
            };
          })(),
        };

  return { backend, frontend };
}
