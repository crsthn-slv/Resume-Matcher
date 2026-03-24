import path from 'node:path';

import { BrowserWindow } from 'electron';

export function createMainWindow(): BrowserWindow {
  return new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });
}
