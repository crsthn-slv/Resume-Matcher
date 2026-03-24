import path from 'node:path';

import { BrowserWindow } from 'electron';

export function createSplashWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 640,
    height: 420,
    show: true,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  void window.loadFile(path.join(__dirname, '../ui/splash.html'));
  return window;
}
