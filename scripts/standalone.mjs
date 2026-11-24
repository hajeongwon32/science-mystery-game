import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
let html = await readFile(path.join(root, 'dist', 'index.html'), 'utf8');
const script = /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/;
const stylesheet = /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/;
const jsPath = html.match(script)?.[1];
const cssPath = html.match(stylesheet)?.[1];
if (!jsPath || !cssPath) throw new Error('The build must have one entry and one stylesheet.');
const readAsset = (assetPath) =>
  readFile(path.join(root, 'dist', assetPath.replace(/^\//, '')), 'utf8');
let js = await readAsset(jsPath),
  css = await readAsset(cssPath);
const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};
for (const filename of await readdir(path.join(root, 'dist', 'assets'))) {
  const mime = mimeTypes[path.extname(filename)];
  if (!mime) continue;
  const bytes = await readFile(path.join(root, 'dist', 'assets', filename));
  const url = `/assets/${filename}`,
    data = `data:${mime};base64,${bytes.toString('base64')}`;
  js = js.split(url).join(data);
  css = css.split(url).join(data);
  html = html.split(url).join(data);
}
// A function replacement keeps literal dollar sequences in generated code intact.
html = html.replace(
  script,
  () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`,
);
html = html.replace(stylesheet, () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
const outputDirectory = path.join(root, 'exports');
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, '창밖에있던사람-인트로.html');
await writeFile(output, html, 'utf8');
console.log('Standalone opening playtest: ' + output);
