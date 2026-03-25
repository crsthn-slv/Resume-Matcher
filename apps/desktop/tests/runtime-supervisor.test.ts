import { describe, expect, it, vi } from 'vitest';

import { createRuntimeCommands } from '../src/runtime/command-factory';
import { createRuntimeSupervisor } from '../src/runtime/supervisor';
import { killProcessTree } from '../src/runtime/process-tree';

describe('runtime supervisor', () => {
  it('starts backend-before-frontend and uses the health gate', async () => {
    const calls: string[] = [];
    const spawnMock = vi.fn((command: string) => {
      calls.push(command);
      return {
        pid: calls.length,
        stdout: { pipe: vi.fn() },
        stderr: { pipe: vi.fn() },
        once: vi.fn(),
      };
    });
    const probeMock = vi
      .fn<(_: string) => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    const supervisor = createRuntimeSupervisor({
      mode: 'development',
      spawnImpl: spawnMock as never,
      probeImpl: probeMock,
      retries: 1,
      intervalMs: 0,
    });

    const state = await supervisor.start();

    expect(calls[0]).toBe('uv');
    expect(calls[1]).toBe('npm');
    expect(spawnMock).toHaveBeenNthCalledWith(
      1,
      'uv',
      expect.any(Array),
      expect.objectContaining({ detached: process.platform !== 'win32', windowsHide: true })
    );
    expect(probeMock).toHaveBeenCalledWith('http://127.0.0.1:8000/api/v1/health');
    expect(state.stage).toBe('ready');
  });

  it('stops frontend teardown plus backend teardown on stop', async () => {
    const killed: number[] = [];
    const spawnMock = vi.fn((command: string) => ({
      pid: command === 'uv' ? 11 : 22,
      stdout: { pipe: vi.fn() },
      stderr: { pipe: vi.fn() },
      once: vi.fn(),
    }));
    const probeMock = vi
      .fn<(_: string) => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    const originalKill = process.kill;
    const killMock = vi.fn((pid: number) => {
      killed.push(pid);
      return true;
    });
    // @ts-expect-error test shim
    process.kill = killMock;

    const supervisor = createRuntimeSupervisor({
      mode: 'development',
      spawnImpl: spawnMock as never,
      probeImpl: probeMock,
      retries: 1,
      intervalMs: 0,
      killProcessTreeImpl: async ({ pid }) => {
        process.kill(pid);
      },
    });

    await supervisor.start();
    await supervisor.stop();

    process.kill = originalKill;

    expect(killed).toContain(22);
    expect(killed).toContain(11);
  });

  it('fails startup when the backend health probe never becomes ready', async () => {
    const spawnMock = vi.fn((command: string) => ({
      pid: command === 'uv' ? 31 : 32,
      stdout: { pipe: vi.fn() },
      stderr: { pipe: vi.fn() },
      once: vi.fn(),
    }));
    const probeMock = vi.fn<(_: string) => Promise<boolean>>().mockResolvedValue(false);
    const originalKill = process.kill;
    // @ts-expect-error test shim
    process.kill = vi.fn(() => true);

    const supervisor = createRuntimeSupervisor({
      mode: 'development',
      spawnImpl: spawnMock as never,
      probeImpl: probeMock,
      retries: 1,
      intervalMs: 0,
      killProcessTreeImpl: async () => {},
    });

    const state = await supervisor.start();

    process.kill = originalKill;

    expect(state.stage).toBe('failed');
    expect(state.step).toBe('waiting-backend');
    expect(state.error).toContain('timed out');
  });

  it('creates packaged production commands with stable data and browser env paths', () => {
    const commands = createRuntimeCommands('production', {
      runtimeRoot: '/opt/resume-matcher',
      dataDir: '/Users/demo/AppData/Local/ResumeMatcher/data',
      backupDir: '/Users/demo/AppData/Local/ResumeMatcher/backups',
    });

    expect(commands.backend.command).toContain('rm-backend.exe');
    expect(commands.frontend.command).toContain('node.exe');
    expect(commands.frontend.args).toEqual([
      '/opt/resume-matcher/runtime/frontend/server.js',
    ]);
    expect(commands.backend.env.RM_DATA_DIR).toBe(
      '/Users/demo/AppData/Local/ResumeMatcher/data',
    );
    expect(commands.backend.env.RM_BACKUP_DIR).toBe(
      '/Users/demo/AppData/Local/ResumeMatcher/backups',
    );
    expect(commands.backend.env.PLAYWRIGHT_BROWSERS_PATH).toBe(
      '/opt/resume-matcher/runtime/playwright',
    );
    expect(commands.frontend.env.PORT).toBe('3000');
    expect(commands.frontend.env.HOSTNAME).toBe('127.0.0.1');
  });

  it('kills the full process group on posix before falling back to the direct pid', async () => {
    const originalKill = process.kill;
    const calls: Array<{ pid: number; signal?: NodeJS.Signals }> = [];
    const killMock = vi.fn((pid: number, signal?: NodeJS.Signals) => {
      calls.push({ pid, signal });
      if (pid < 0 && signal === 'SIGTERM') {
        return true;
      }
      throw new Error('already exited');
    });
    // @ts-expect-error test shim
    process.kill = killMock;

    await killProcessTree({
      pid: 4321,
      platform: 'darwin',
      timeoutMs: 0,
    });

    process.kill = originalKill;

    expect(calls[0]).toEqual({ pid: -4321, signal: 'SIGTERM' });
    expect(calls[1]).toEqual({ pid: -4321, signal: 'SIGKILL' });
  });
});
