import path from 'node:path';

import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';

import { DESKTOP_FRONTEND_ORIGIN } from './config';
import type { DesktopBootstrapState } from './shared/contracts';
import {
  DESKTOP_GET_STATE,
  DESKTOP_OPEN_LOGS,
  DESKTOP_RETRY,
  DESKTOP_STATE_EVENT,
} from './shared/ipc';
import { getLogSet } from './runtime/logging';
import { createRuntimeSupervisor } from './runtime/supervisor';
import { createErrorWindow } from './windows/createErrorWindow';
import { createMainWindow } from './windows/createMainWindow';
import { createSplashWindow } from './windows/createSplashWindow';

let splashWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let errorWindow: BrowserWindow | null = null;

const supervisor = createRuntimeSupervisor({
  mode: app.isPackaged ? 'production' : 'development',
});

function broadcastState(state: DesktopBootstrapState): void {
  splashWindow?.webContents.send(DESKTOP_STATE_EVENT, state);
  errorWindow?.webContents.send(DESKTOP_STATE_EVENT, state);
  mainWindow?.webContents.send(DESKTOP_STATE_EVENT, state);
}

function destroyWindow(window: BrowserWindow | null): null {
  if (window && !window.isDestroyed()) {
    window.close();
  }
  return null;
}

function wireExternalLinks(window: BrowserWindow): void {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(DESKTOP_FRONTEND_ORIGIN)) {
      return { action: 'allow' };
    }
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(DESKTOP_FRONTEND_ORIGIN)) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
}

async function showReadyWindow(state: DesktopBootstrapState): Promise<void> {
  if (state.stage !== 'ready' || !state.url) {
    return;
  }

  errorWindow = destroyWindow(errorWindow);
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
    wireExternalLinks(mainWindow);
    mainWindow.once('ready-to-show', () => {
      splashWindow = destroyWindow(splashWindow);
      mainWindow?.show();
      mainWindow?.focus();
    });
    mainWindow.once('closed', () => {
      mainWindow = null;
    });
  }

  await mainWindow.loadURL(state.url);
}

function showFailureWindow(): void {
  mainWindow = destroyWindow(mainWindow);
  if (!errorWindow || errorWindow.isDestroyed()) {
    errorWindow = createErrorWindow();
    errorWindow.once('closed', () => {
      errorWindow = null;
    });
  }
  splashWindow = destroyWindow(splashWindow);
}

async function bootstrap(): Promise<void> {
  splashWindow ??= createSplashWindow();
  splashWindow.once('closed', () => {
    if (splashWindow?.isDestroyed()) {
      splashWindow = null;
    }
  });
  const state = await supervisor.start();
  if (state.stage === 'ready') {
    await showReadyWindow(state);
    return;
  }
  showFailureWindow();
}

function registerIpc(): void {
  ipcMain.handle(DESKTOP_GET_STATE, () => supervisor.getState());
  ipcMain.handle(DESKTOP_RETRY, async () => {
    splashWindow = destroyWindow(splashWindow);
    splashWindow = createSplashWindow();
    errorWindow = destroyWindow(errorWindow);
    const state = await supervisor.retry();
    if (state.stage === 'ready') {
      await showReadyWindow(state);
    } else {
      showFailureWindow();
    }
    return state;
  });
  ipcMain.handle(DESKTOP_OPEN_LOGS, async () => {
    const { directory } = getLogSet();
    await shell.showItemInFolder(directory);
    return directory;
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

Menu.setApplicationMenu(null);
registerIpc();

supervisor.onStateChange((state) => {
  broadcastState(state);
  if (state.stage === 'failed') {
    showFailureWindow();
  }
});

app.on('second-instance', () => {
  mainWindow?.show();
  mainWindow?.focus();
});

app.on('window-all-closed', async () => {
  await supervisor.stop();
  app.quit();
});

app.on('before-quit', async () => {
  await supervisor.stop();
});

app.whenReady().then(async () => {
  await bootstrap();
});
