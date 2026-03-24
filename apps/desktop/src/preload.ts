import { contextBridge, ipcRenderer } from 'electron';

import type { DesktopBootstrapState, DesktopShellApi } from './shared/contracts';
import {
  DESKTOP_GET_STATE,
  DESKTOP_OPEN_LOGS,
  DESKTOP_RETRY,
  DESKTOP_STATE_EVENT,
} from './shared/ipc';

const api: DesktopShellApi = {
  getBootstrapState() {
    return ipcRenderer.invoke(DESKTOP_GET_STATE) as Promise<DesktopBootstrapState>;
  },
  retryBootstrap() {
    return ipcRenderer.invoke(DESKTOP_RETRY) as Promise<DesktopBootstrapState>;
  },
  openLogsDirectory() {
    return ipcRenderer.invoke(DESKTOP_OPEN_LOGS) as Promise<string>;
  },
  onBootstrapState(listener) {
    const wrapped = (_event: unknown, ...args: unknown[]) => {
      const [state] = args as [DesktopBootstrapState];
      listener(state);
    };
    ipcRenderer.on(DESKTOP_STATE_EVENT, wrapped);
    return () => ipcRenderer.removeListener(DESKTOP_STATE_EVENT, wrapped);
  },
};

contextBridge.exposeInMainWorld('desktopShell', api);
