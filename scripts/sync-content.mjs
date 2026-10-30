// Trae de plumario-app lo que la web muestra: el catálogo, la muestra de ilustraciones en color y
// la silueta de todas las aves. El álbum completo se desbloquea en la app: solo las aves de
// src/data/sample.json se publican en color.
// Uso: pnpm content:sync (con plumario-app junto a este repo, o APP_DIR apuntando a él).
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = process.env.APP_DIR ?? join(ROOT, '..', 'plumario-app');
const SOURCE = join(APP, 'apps', 'mobile', 'assets', 'stickers');
const TARGET = join(ROOT, 'public', 'stickers');
const SIZES = [160, 320];
const SHADOW_SIZE = 240;

// Misma regla que categoryOf en packages/core/src/domain/card.ts de la app.
function categoryOf({ iucn, emblematic, endemic }) {
  if (iucn === 'VU' || iucn === 'EN' || iucn === 'CR') return 'diamond';
  if (emblematic) return 'ruby';
  if (endemic) return 'gold';
  if (iucn === 'NT') return 'silver';
  return 'holographic';
}

const catalog = JSON.parse(await readFile(join(APP, 'data', 'species', 'ica.json'), 'utf8'));
const sample = new Set(JSON.parse(await readFile(join(ROOT, 'src', 'data', 'sample.json'), 'utf8')));
const birds = catalog.species
  .filter((species) => species.taxonClass === 'bird')
  .sort((a, b) => a.albumNumber - b.albumNumber)
  .map((species) => ({
    id: species.id,
    number: species.albumNumber,
    name: species.commonName,
    scientificName: species.scientificName,
    family: species.family,
    habitat: species.habitat,
    category: categoryOf(species),
    endemic: species.endemic,
    threatened: species.threatened,
  }));

const files = new Set(await readdir(SOURCE));
const missing = birds.filter((bird) => !files.has(`${bird.id}.webp`));
if (missing.length) throw new Error(`Faltan ilustraciones: ${missing.map((bird) => bird.id).join(', ')}`);
const unknown = [...sample].filter((id) => !birds.some((bird) => bird.id === id));
if (unknown.length) throw new Error(`La muestra nombra aves que no existen: ${unknown.join(', ')}`);

await writeFile(join(ROOT, 'src', 'data', 'birds.json'), `${JSON.stringify(birds)}\n`);
await rm(TARGET, { recursive: true, force: true });

for (const size of SIZES) {
  await mkdir(join(TARGET, String(size)), { recursive: true });
  for (const id of sample) {
    await sharp(join(SOURCE, `${id}.webp`))
      .resize(size, size)
      .webp({ quality: size > 200 ? 82 : 76, alphaQuality: 90, effort: 6 })
      .toFile(join(TARGET, String(size), `${id}.webp`));
  }
}

// La silueta sale del alfa y se pinta de negro: no lleva nada de la ilustración. Se nombra por el
// número del álbum para no publicar la lista de especies junto con las figuras.
await mkdir(join(TARGET, 'shadow'), { recursive: true });
for (const bird of birds) {
  const alpha = await sharp(join(SOURCE, `${bird.id}.webp`))
    .resize(SHADOW_SIZE, SHADOW_SIZE)
    .ensureAlpha()
    .extractChannel('alpha')
    .toColourspace('b-w')
    .png()
    .toBuffer();
  await sharp({ create: { width: SHADOW_SIZE, height: SHADOW_SIZE, channels: 3, background: '#000000' } })
    .joinChannel(alpha)
    .webp({ quality: 50, alphaQuality: 80, effort: 6 })
    .toFile(join(TARGET, 'shadow', `${String(bird.number).padStart(3, '0')}.webp`));
}

console.log(`${birds.length} siluetas y ${sample.size} aves en color`);
