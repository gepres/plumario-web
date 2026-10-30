// Las aves que la persona marcó como vistas. Vive solo en este navegador.
const KEY = 'plumario-seen';
const CHANGE = 'plumario:seen-change';

function read(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

let seen = read();

function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // Sin almacenamiento, la marca dura lo que dure la página.
  }
  document.dispatchEvent(new CustomEvent(CHANGE));
}

export function isSeen(id: string): boolean {
  return seen.has(id);
}

export function seenCount(): number {
  return seen.size;
}

export function setSeen(id: string, value: boolean) {
  if (seen.has(id) === value) return;
  seen = new Set(seen);
  if (value) seen.add(id);
  else seen.delete(id);
  commit();
}

export function onSeenChange(listener: () => void) {
  document.addEventListener(CHANGE, listener);
}
