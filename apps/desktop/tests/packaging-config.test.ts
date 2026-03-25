import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface BuilderTarget {
  target: string;
  arch?: string[];
}

interface BuilderConfig {
  productName: string;
  artifactName: string;
  win: {
    target: BuilderTarget[];
  };
  nsis: {
    perMachine: boolean;
    createDesktopShortcut: string;
    createStartMenuShortcut: boolean;
  };
  extraResources: Array<{
    from: string;
    to: string;
  }>;
}

function readBuilderConfig(): BuilderConfig {
  const configPath = path.resolve(__dirname, '../electron-builder.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8')) as BuilderConfig;
}

describe('desktop packaging config', () => {
  it('keeps Resume Matcher product naming and installer artifact naming stable', () => {
    const config = readBuilderConfig();

    expect(config.productName).toBe('Resume Matcher');
    expect(config.artifactName).toBe('ResumeMatcher-Setup-${version}.${ext}');
  });

  it('keeps NSIS as the Windows target with machine-wide installation', () => {
    const config = readBuilderConfig();

    expect(config.win.target).toContainEqual({ target: 'nsis', arch: ['x64'] });
    expect(config.nsis.perMachine).toBe(true);
    expect(config.nsis.createDesktopShortcut).toBe('always');
    expect(config.nsis.createStartMenuShortcut).toBe(true);
  });

  it('keeps the packaged runtime under the path expected by the Electron main process', () => {
    const config = readBuilderConfig();

    expect(config.extraResources).toContainEqual({
      from: '../../dist/desktop',
      to: 'dist/desktop',
    });
  });
});
