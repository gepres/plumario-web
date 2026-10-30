// Trae de plumario-app lo que la web muestra: el catálogo de aves y sus ilustraciones.
// Uso: pnpm content:sync (con plumario-app junto a este repo, o APP_DIR apuntando a él).
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = process.env.APP_DIR ?? join(ROOT, '..', 'plumario-app');
const SOURCE = join(APP, 'apps', 'mobile', 'assets', 'stickers');
const SIZES = [160, 320];

// Misma regla que categoryOf en packages/core/src/domain/card.ts de la app.
function categoryOf({ iucn, emblematic, endemic }) {
  if (iucn === 'VU' || iucn === 'EN' || iucn === 'CR') return 'diamond';
  if (emblematic) return 'ruby';
  if (endemic) return 'gold';
  if (iucn === 'NT') return 'silver';
  return 'holographic';
}

const catalog = JSON.parse(await readFile(join(APP, 'data', 'species', 'ica.json'), 'utf8'));
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

await writeFile(join(ROOT, 'src', 'data', 'birds.json'), `${JSON.stringify(birds)}\n`);

for (const size of SIZES) {
  const target = join(ROOT, 'public', 'stickers', String(size));
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  for (const bird of birds) {
    await sharp(join(SOURCE, `${bird.id}.webp`))
      .resize(size, size)
      .webp({ quality: size > 200 ? 82 : 76, alphaQuality: 90, effort: 6 })
      .toFile(join(target, `${bird.id}.webp`));
  }
}

console.log(`${birds.length} aves sincronizadas en ${SIZES.join(' y ')} px`);
