import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { DESKTOP_OPEN_LOGS, DESKTOP_RETRY } from '../src/shared/ipc';

describe('window shell contracts', () => {
  it('keeps the retry channel stable', () => {
    expect(DESKTOP_RETRY).toBe('desktop-shell:retry');
  });

  it('keeps the open-logs channel stable', () => {
    expect(DESKTOP_OPEN_LOGS).toBe('desktop-shell:open-logs');
  });

  it('contains external-link handling through shell.openExternal', () => {
    const mainFile = fs.readFileSync(path.resolve(__dirname, '../src/main.ts'), 'utf8');
    expect(mainFile).toContain('shell.openExternal');
    expect(mainFile).toContain('setWindowOpenHandler');
  });

  it('contains retry behavior after a failed startup state', () => {
    const mainFile = fs.readFileSync(path.resolve(__dirname, '../src/main.ts'), 'utf8');
    expect(mainFile).toContain('supervisor.retry()');
    expect(mainFile).toContain('DESKTOP_RETRY');
  });
});
