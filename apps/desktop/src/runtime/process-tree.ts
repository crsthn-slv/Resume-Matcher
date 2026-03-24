import { spawn } from 'node:child_process';

export interface KillProcessTreeOptions {
  pid: number;
  platform?: NodeJS.Platform;
  timeoutMs?: number;
  signal?: NodeJS.Signals;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runTaskkill(args: string[]): Promise<void> {
  return new Promise((resolve) => {
    const child = spawn('taskkill', args, { windowsHide: true, stdio: 'ignore' });
    child.on('close', () => resolve());
    child.on('error', () => resolve());
  });
}

function killPosixTarget(pid: number, signal: NodeJS.Signals, useProcessGroup: boolean): boolean {
  const target = useProcessGroup ? -pid : pid;
  try {
    process.kill(target, signal);
    return true;
  } catch {
    return false;
  }
}

export async function killProcessTree({
  pid,
  platform = process.platform,
  timeoutMs = 5000,
  signal = 'SIGTERM',
}: KillProcessTreeOptions): Promise<void> {
  if (platform === 'win32') {
    await runTaskkill(['/pid', String(pid), '/t']);
    await delay(timeoutMs);
    await runTaskkill(['/pid', String(pid), '/t', '/f']);
    return;
  }

  const signaled = killPosixTarget(pid, signal, true) || killPosixTarget(pid, signal, false);
  if (!signaled) {
    return;
  }

  await delay(timeoutMs);

  killPosixTarget(pid, 'SIGKILL', true) || killPosixTarget(pid, 'SIGKILL', false);
}
