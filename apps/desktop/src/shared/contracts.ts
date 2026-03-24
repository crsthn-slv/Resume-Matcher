export type DesktopBootstrapPhase = 'starting' | 'ready' | 'failed' | 'stopping';

export type DesktopStartupStep =
  | 'booting'
  | 'starting-backend'
  | 'waiting-backend'
  | 'starting-frontend'
  | 'waiting-frontend'
  | 'opening-window';

interface DesktopBootstrapStateBase {
  stage: DesktopBootstrapPhase;
  step: DesktopStartupStep;
  url: string | null;
  message: string;
  logDirectory: string | null;
}

export interface DesktopBootstrapStartingState extends DesktopBootstrapStateBase {
  stage: 'starting';
}

export interface DesktopBootstrapReadyState extends DesktopBootstrapStateBase {
  stage: 'ready';
  url: string;
}

export interface DesktopBootstrapFailedState extends DesktopBootstrapStateBase {
  stage: 'failed';
  error: string;
}

export interface DesktopBootstrapStoppingState extends DesktopBootstrapStateBase {
  stage: 'stopping';
}

export type DesktopBootstrapState =
  | DesktopBootstrapStartingState
  | DesktopBootstrapReadyState
  | DesktopBootstrapFailedState
  | DesktopBootstrapStoppingState;

export type DesktopBootstrapStateListener = (state: DesktopBootstrapState) => void;

export interface DesktopShellApi {
  getBootstrapState: () => Promise<DesktopBootstrapState>;
  retryBootstrap: () => Promise<DesktopBootstrapState>;
  openLogsDirectory: () => Promise<string>;
  onBootstrapState: (listener: DesktopBootstrapStateListener) => () => void;
}
