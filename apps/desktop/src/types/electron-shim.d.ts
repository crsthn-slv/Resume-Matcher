declare module 'electron' {
  export interface Event {
    preventDefault(): void;
  }

  export interface App {
    whenReady(): Promise<void>;
    quit(): void;
    on(event: 'activate' | 'second-instance' | 'window-all-closed' | 'before-quit', listener: (...args: unknown[]) => void): void;
    requestSingleInstanceLock(): boolean;
    getPath(name: 'logs' | 'userData'): string;
    isPackaged: boolean;
  }

  export interface BrowserWindowConstructorOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    show?: boolean;
    resizable?: boolean;
    autoHideMenuBar?: boolean;
    webPreferences?: {
      contextIsolation?: boolean;
      nodeIntegration?: boolean;
      sandbox?: boolean;
      preload?: string;
    };
  }

  export class BrowserWindow {
    constructor(options?: BrowserWindowConstructorOptions);
    static getAllWindows(): BrowserWindow[];
    loadURL(url: string): Promise<void>;
    loadFile(path: string): Promise<void>;
    once(event: 'ready-to-show' | 'closed', listener: () => void): void;
    close(): void;
    show(): void;
    focus(): void;
    isDestroyed(): boolean;
    webContents: {
      send(channel: string, ...args: unknown[]): void;
      on(
        event: 'will-navigate',
        listener: (event: Event, url: string) => void
      ): void;
      setWindowOpenHandler(
        handler: (details: { url: string }) => { action: 'allow' | 'deny' }
      ): void;
    };
  }

  export const Menu: {
    setApplicationMenu(menu: null): void;
  };

  export const shell: {
    openPath(path: string): Promise<string>;
    openExternal(url: string): Promise<void>;
    showItemInFolder(path: string): Promise<string>;
  };

  export const app: App;

  export const contextBridge: {
    exposeInMainWorld(key: string, api: unknown): void;
  };

  export const ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<any>;
    on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
    removeListener(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
  };

  export const ipcMain: {
    handle(channel: string, listener: (...args: unknown[]) => unknown): void;
  };
}
