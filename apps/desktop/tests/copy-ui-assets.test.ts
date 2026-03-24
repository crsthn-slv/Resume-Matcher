import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { copyUiAssets } from '../src/scripts/copyUiAssets';

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('copyUiAssets', () => {
  it('copies splash and error html files into dist/ui', () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-ui-assets-'));
    tempRoots.push(rootDir);

    const sourceDir = path.join(rootDir, 'src/ui');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'splash.html'), '<html>splash</html>');
    fs.writeFileSync(path.join(sourceDir, 'error.html'), '<html>error</html>');
    fs.writeFileSync(path.join(sourceDir, 'ignore.txt'), 'ignore');

    copyUiAssets({ rootDir });

    expect(fs.readFileSync(path.join(rootDir, 'dist/ui/splash.html'), 'utf8')).toContain('splash');
    expect(fs.readFileSync(path.join(rootDir, 'dist/ui/error.html'), 'utf8')).toContain('error');
    expect(fs.existsSync(path.join(rootDir, 'dist/ui/ignore.txt'))).toBe(false);
  });
});
