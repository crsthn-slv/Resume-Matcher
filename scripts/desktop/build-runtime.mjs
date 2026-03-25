import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

const runtimeRootRelative = 'dist/desktop/runtime';
const frontendRuntimeRelative = 'dist/desktop/runtime/frontend';
const backendRuntimeRelative = 'dist/desktop/runtime/backend';
const nodeExecutableRelative = 'dist/desktop/runtime/bin/node.exe';
const playwrightRuntimeRelative = 'dist/desktop/runtime/playwright';

const runtimeRoot = path.join(projectRoot, runtimeRootRelative);
const frontendRuntimeDir = path.join(projectRoot, frontendRuntimeRelative);
const backendRuntimeDir = path.join(projectRoot, backendRuntimeRelative);
const binRuntimeDir = path.dirname(path.join(projectRoot, nodeExecutableRelative));
const playwrightRuntimeDir = path.join(projectRoot, playwrightRuntimeRelative);

const frontendAppDir = path.join(projectRoot, 'apps/frontend');
const frontendStandaloneDir = path.join(frontendAppDir, '.next/standalone');
const frontendStaticDir = path.join(frontendAppDir, '.next/static');
const frontendPublicDir = path.join(frontendAppDir, 'public');

const backendBuildScript = path.join(projectRoot, 'scripts/desktop/build-backend.py');
const backendExecutable = path.join(
  backendRuntimeDir,
  'rm-backend',
  'rm-backend.exe',
);
const nodeTargetPath = path.join(projectRoot, nodeExecutableRelative);

const expectedLayout = {
  runtimeRoot,
  frontendServer: path.join(frontendRuntimeDir, 'server.js'),
  frontendStaticDir: path.join(frontendRuntimeDir, '.next/static'),
  frontendPublicDir: path.join(frontendRuntimeDir, 'public'),
  backendExecutable,
  nodeExecutable: nodeTargetPath,
  playwrightBrowsersDir: playwrightRuntimeDir,
};

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function removeDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true });
}

async function copyDir(source, destination) {
  await fs.cp(source, destination, { recursive: true, force: true });
}

async function copyFile(source, destination) {
  await ensureDir(path.dirname(destination));
  await fs.copyFile(source, destination);
}

async function runCommand(command, args, options = {}) {
  const { spawn } = await import('node:child_process');

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, ...options.env },
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`,
        ),
      );
    });
  });
}

async function verifySourceInputs() {
  const requiredPaths = [
    path.join(frontendStandaloneDir, 'server.js'),
    frontendStaticDir,
    frontendPublicDir,
    backendBuildScript,
    process.execPath,
  ];

  for (const requiredPath of requiredPaths) {
    try {
      await fs.access(requiredPath);
    } catch {
      throw new Error(`Missing required build input: ${requiredPath}`);
    }
  }
}

async function verifyLayoutContract() {
  const checks = [
    ['frontend runtime', expectedLayout.frontendServer],
    ['frontend static dir', expectedLayout.frontendStaticDir],
    ['frontend public dir', expectedLayout.frontendPublicDir],
    ['backend executable', expectedLayout.backendExecutable],
    ['node executable', expectedLayout.nodeExecutable],
    ['playwright browsers dir', expectedLayout.playwrightBrowsersDir],
  ];

  for (const [, targetPath] of checks) {
    if (!targetPath.startsWith(runtimeRoot)) {
      throw new Error(`Packaged runtime target escapes runtime root: ${targetPath}`);
    }
  }

  await fs.access(path.join(projectRoot, 'apps/backend/desktop.spec'));

  console.log('Packaged runtime layout verified');
  for (const [label, targetPath] of checks) {
    console.log(`${label}: ${path.relative(projectRoot, targetPath)}`);
  }
}

async function buildRuntime() {
  await removeDir(runtimeRoot);
  await ensureDir(runtimeRoot);

  await runCommand('npm', ['--prefix', 'apps/frontend', 'run', 'build']);
  await verifySourceInputs();

  await copyDir(frontendStandaloneDir, frontendRuntimeDir);
  await copyDir(frontendStaticDir, path.join(frontendRuntimeDir, '.next/static'));
  await copyDir(frontendPublicDir, path.join(frontendRuntimeDir, 'public'));

  await copyFile(process.execPath, nodeTargetPath);

  await runCommand('uv', [
    'run',
    '--project',
    'apps/backend',
    '--extra',
    'desktop',
    'python',
    'scripts/desktop/build-backend.py',
  ]);

  await ensureDir(playwrightRuntimeDir);
  await runCommand(
    'uv',
    [
      'run',
      '--project',
      'apps/backend',
      '--extra',
      'desktop',
      'python',
      '-m',
      'playwright',
      'install',
      'chromium',
    ],
    {
      env: {
        PLAYWRIGHT_BROWSERS_PATH: playwrightRuntimeDir,
      },
    },
  );

  await fs.access(expectedLayout.frontendServer);
  await fs.access(expectedLayout.nodeExecutable);
  await fs.access(expectedLayout.playwrightBrowsersDir);
  await fs.access(expectedLayout.backendExecutable);
}

async function cleanRuntime() {
  await removeDir(runtimeRoot);
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has('--clean')) {
    await cleanRuntime();
    return;
  }

  if (args.has('--verify-layout')) {
    await verifyLayoutContract();
    return;
  }

  await buildRuntime();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
