import fs from 'node:fs';
import path from 'node:path';

export interface CopyUiAssetsOptions {
  rootDir?: string;
}

export function copyUiAssets(options: CopyUiAssetsOptions = {}): void {
  const rootDir = options.rootDir ?? path.resolve(__dirname, '../..');
  const sourceDir = path.join(rootDir, 'src/ui');
  const targetDir = path.join(rootDir, 'dist/ui');

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) {
      continue;
    }

    fs.copyFileSync(path.join(sourceDir, entry.name), path.join(targetDir, entry.name));
  }
}

if (require.main === module) {
  copyUiAssets({ rootDir: process.cwd() });
}
