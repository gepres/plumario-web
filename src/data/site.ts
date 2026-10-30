import birdsJson from './birds.json';
import sampleIds from './sample.json';

export type Habitat = 'coast' | 'wetlands' | 'desert' | 'highlands' | 'openSea';
export type Category = 'holographic' | 'silver' | 'gold' | 'ruby' | 'diamond';

export type Bird = {
  id: string;
  number: number;
  name: string;
  scientificName: string;
  family: string;
  habitat: Habitat;
  category: Category;
  endemic: boolean;
  threatened: boolean;
};

export const CONTACT_EMAIL = 'genaropretill@gmail.com';
export const LEGAL_UPDATED = '30 de octubre de 2026';

export const birds = birdsJson as Bird[];
export const TOTAL_BIRDS = birds.length;
export const THREATENED_BIRDS = birds.filter((bird) => bird.threatened).length;

// Solo estas aves se publican en color: las demás se desbloquean en la app con una foto.
const sample = new Set<string>(sampleIds);
export const SAMPLE_BIRDS = birds.filter((bird) => sample.has(bird.id));
export const LOCKED_BIRDS = birds.filter((bird) => !sample.has(bird.id));

// Las tintas son las de stickerTints en @plumario/tokens; el color, el de la paleta F · Ribera.
export const HABITATS: Record<Habitat, { name: string; place: string; tint: string; color: string }> = {
  coast: { name: 'Litoral', place: 'Playas, islas y acantilados.', tint: '#D2E4EC', color: '#3D858D' },
  wetlands: { name: 'Humedales', place: 'Lagunas, totorales y desembocaduras.', tint: '#D9EADB', color: '#678C3D' },
  desert: { name: 'Desierto', place: 'Dunas, lomas y valles secos.', tint: '#EADFCB', color: '#B89042' },
  highlands: { name: 'Sierra', place: 'Las alturas andinas de Ica.', tint: '#E0DDEA', color: '#857599' },
  openSea: { name: 'Mar abierto', place: 'Las que viven lejos de la orilla.', tint: '#CFDCE8', color: '#3F6880' },
};

export const HABITAT_ORDER = Object.keys(HABITATS) as Habitat[];

export const CATEGORIES: Record<Category, { name: string; rule: string; birdId: string }> = {
  diamond: { name: 'Diamante', rule: 'Amenazadas según la UICN', birdId: 'vultur-gryphus' },
  ruby: { name: 'Rubí', rule: 'Emblemáticas', birdId: 'phoenicopterus-chilensis' },
  gold: { name: 'Oro', rule: 'Endémicas: solo viven en el Perú', birdId: 'polyonymus-caroli' },
  silver: { name: 'Plata', rule: 'Casi amenazadas', birdId: 'larosterna-inca' },
  holographic: { name: 'Holográfico', rule: 'Todas las demás', birdId: 'thaumastura-cora' },
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES) as Category[];

export function categoryCount(category: Category): number {
  return birds.filter((bird) => bird.category === category).length;
}

export function birdById(id: string): Bird {
  const bird = birds.find((candidate) => candidate.id === id);
  if (!bird) throw new Error(`No existe el ave ${id}`);
  return bird;
}

export function albumNumber(number: number): string {
  return String(number).padStart(3, '0');
}
