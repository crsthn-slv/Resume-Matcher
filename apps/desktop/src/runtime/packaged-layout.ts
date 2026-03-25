import path from 'node:path';

export const PACKAGED_RUNTIME_VERSION = 1;

export interface PackagedRuntimeLayout {
  frontendServer: string;
  frontendStaticDir: string;
  frontendPublicDir: string;
  backendExecutable: string;
  nodeExecutable: string;
  playwrightBrowsersDir: string;
}

export function resolvePackagedRuntimeLayout(
  baseDir: string,
): PackagedRuntimeLayout {
  return {
    frontendServer: path.join(baseDir, 'runtime/frontend/server.js'),
    frontendStaticDir: path.join(baseDir, 'runtime/frontend/.next/static'),
    frontendPublicDir: path.join(baseDir, 'runtime/frontend/public'),
    backendExecutable: path.join(
      baseDir,
      'runtime/backend/rm-backend/rm-backend.exe',
    ),
    nodeExecutable: path.join(baseDir, 'runtime/bin/node.exe'),
    playwrightBrowsersDir: path.join(baseDir, 'runtime/playwright'),
  };
}
