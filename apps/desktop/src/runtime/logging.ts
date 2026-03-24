import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { app } from 'electron';

export interface DesktopLogSet {
  directory: string;
  desktopHostLog: string;
  backendLog: string;
  frontendLog: string;
}

export function getLogSet(): DesktopLogSet {
  const baseDirectory =
    typeof app?.getPath === 'function' ? app.getPath('userData') : path.join(os.tmpdir(), 'resume-matcher');
  const directory = path.join(baseDirectory, 'logs');
  fs.mkdirSync(directory, { recursive: true });

  return {
    directory,
    desktopHostLog: path.join(directory, 'desktop-host.log'),
    backendLog: path.join(directory, 'backend.log'),
    frontendLog: path.join(directory, 'frontend.log'),
  };
}

export function appendHostLog(message: string): void {
  const { desktopHostLog } = getLogSet();
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(desktopHostLog, line);
}
