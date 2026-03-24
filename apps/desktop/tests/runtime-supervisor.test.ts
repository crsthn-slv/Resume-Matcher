import { describe, expect, it, vi } from 'vitest';

import { createRuntimeSupervisor } from '../src/runtime/supervisor';

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
});
