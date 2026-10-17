/**
 * resQlink favicon builder — generates PNG fallbacks from public/favicon.svg.
 * Run: node scripts/build-favicon.mjs   (optional; the SVG favicon works alone)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const svg = readFileSync(path.join(root, 'public', 'favicon.svg'), 'utf8');

const targets = [
  { file: 'public/favicon-32.png', size: 32 },
  { file: 'public/apple-touch-icon.png', size: 180 }
];

// Minimal standalone rasteriser using an offscreen window is not available in
// plain Node, so this script shells out to Chrome (installed on this machine)
// in headless mode to screenshot the SVG at each target size.
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'favicon-'));
const chromePaths =
  process.platform === 'win32'
    ? [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe')
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];

const chrome = chromePaths.find((p) => {
  try {
    return p && spawnSync('node', ['-e', `require('fs').accessSync(${JSON.stringify(p)})`]).status === 0;
  } catch {
    return false;
  }
});

if (!chrome) {
  console.error('Chrome not found — cannot rasterise PNG fallbacks.');
  console.error('The SVG favicon still works on its own; commit favicon-32.png / apple-touch-icon.png manually.');
  process.exit(1);
}

const svgPath = path.join(root, 'public', 'favicon.svg');
let failed = false;

for (const { file, size } of targets) {
  const out = path.join(tmp, `${size}.png`);
  const html = path.join(tmp, `${size}.html`);
  writeFileSync(
    html,
    `<!doctype html><body style="margin:0"><img src="file:///${svgPath.replace(/\\/g, '/')}" width="${size}" height="${size}"></body>`
  );
  const res = spawnSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      `--screenshot=${out}`,
      `--window-size=${size},${size}`,
      '--hide-scrollbars',
      `file:///${html.replace(/\\/g, '/')}`
    ],
    { stdio: 'pipe' }
  );
  try {
    const png = readFileSync(out);
    writeFileSync(path.join(root, file), png);
    console.log(`✓ ${file} (${size}×${size}, ${png.length} bytes)`);
  } catch {
    failed = true;
    console.error(`✗ ${file} — Chrome screenshot failed: ${res.stderr?.toString().slice(0, 200)}`);
  }
}

process.exit(failed ? 1 : 0);
