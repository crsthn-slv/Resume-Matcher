import path from 'node:path';

import { BrowserWindow } from 'electron';

export function createErrorWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 720,
    height: 520,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  void window.loadFile(path.join(__dirname, '../ui/error.html'));
  return window;
}
