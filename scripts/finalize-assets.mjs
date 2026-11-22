import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const provenance = JSON.parse(await readFile(path.join(root, 'assets/provenance.json'), 'utf8'));
for (const asset of provenance.assets) {
  const filename = path.join(root, 'assets', asset.file);
  const bytes = await readFile(filename);
  const description = Buffer.from(`Generated with OpenAI built-in Imagegen. Demonstration image. Prompt: ${asset.prompt}`, 'utf8');
  if (description.length > 65000) throw new Error('JPEG comment too long');
  const marker = Buffer.alloc(4);
  marker[0] = 0xff; marker[1] = 0xfe;
  marker.writeUInt16BE(description.length + 2, 2);
  if (!bytes.subarray(2, 6).equals(marker)) await writeFile(filename, Buffer.concat([bytes.subarray(0, 2), marker, description, bytes.subarray(2)]));
}
for (const filename of ['index.html', 'app.js']) {
  const target = path.join(root, filename);
  const content = (await readFile(target, 'utf8')).replaceAll('assets/campaign.png', 'assets/campaign.jpg').replaceAll('assets/product.png', 'assets/product.jpg').replaceAll('assets/evening.png', 'assets/evening.jpg');
  await writeFile(target, content);
}
console.log('Prepared JPEG assets with embedded generation prompts; source images preserved.');
