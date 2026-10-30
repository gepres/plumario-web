import { isSeen, onSeenChange, seenCount, setSeen } from './album-store';
import { pauseScroll, resumeScroll } from './motion';

const root = document.querySelector<HTMLElement>('[data-album]');
if (root) setUpAlbum(root);

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function setUpAlbum(section: HTMLElement) {
  const total = Number(section.dataset.total);
  const grid = section.querySelector<HTMLElement>('[data-album-grid]')!;
  const search = section.querySelector<HTMLInputElement>('[data-album-search]')!;
  const habitat = section.querySelector<HTMLSelectElement>('[data-album-habitat]')!;
  const seenFilter = section.querySelector<HTMLSelectElement>('[data-album-seen]')!;
  const results = section.querySelector<HTMLElement>('[data-album-results]')!;
  const counter = section.querySelector<HTMLElement>('[data-album-count]')!;
  const moreBox = section.querySelector<HTMLElement>('.album__more')!;
  const more = section.querySelector<HTMLButtonElement>('[data-album-more]')!;
  const dialog = section.querySelector<HTMLDialogElement>('[data-bird-dialog]')!;
  const birds = [...section.querySelectorAll<HTMLButtonElement>('[data-bird]')];
  const index = birds.map((bird) => ({
    bird,
    item: bird.closest('li')!,
    text: normalize(`${bird.dataset.name} ${bird.dataset.scientific}`),
  }));
  let opened: HTMLButtonElement | null = null;
  let expanded = false;

  function paintSeen() {
    for (const bird of birds) bird.toggleAttribute('data-seen', isSeen(bird.dataset.bird!));
    counter.textContent = `Llevas ${seenCount()} de ${total}`;
  }

  function applyFilters() {
    const query = normalize(search.value.trim());
    const filtering = Boolean(query || habitat.value || seenFilter.value);
    let shown = 0;
    for (const { bird, item, text } of index) {
      const seen = isSeen(bird.dataset.bird!);
      const visible =
        (!query || text.includes(query)) &&
        (!habitat.value || bird.dataset.habitat === habitat.value) &&
        (seenFilter.value !== 'seen' || seen) &&
        (seenFilter.value !== 'missing' || !seen);
      item.hidden = !visible;
      if (visible) shown += 1;
    }
    grid.toggleAttribute('data-collapsed', !filtering && !expanded);
    moreBox.hidden = filtering || expanded;
    if (!filtering) results.textContent = '';
    else if (shown === 0) results.textContent = 'Ninguna ave coincide. Prueba con otro nombre o quita un filtro.';
    else results.textContent = shown === 1 ? '1 ave' : `${shown} aves`;
  }

  function fillDialog(bird: HTMLButtonElement) {
    const { dataset } = bird;
    const set = (key: string, text: string) => {
      dialog.querySelector(`[data-dialog-${key}]`)!.textContent = text;
    };
    const image = dialog.querySelector<HTMLImageElement>('[data-dialog-image]')!;
    image.src = `/stickers/320/${dataset.bird}.webp`;
    dialog.querySelector<HTMLElement>('[data-dialog-art]')!.style.background = dataset.tint!;
    set('name', dataset.name!);
    set('scientific', dataset.scientific!);
    set('number', String(dataset.number).padStart(3, '0'));
    set('habitat', dataset.habitatName!);
    set('category', dataset.category!);
    set('family', dataset.family!);
    const notes = [];
    if ('endemic' in dataset) notes.push('Endémica: solo vive en el Perú.');
    if ('threatened' in dataset) notes.push('Amenazada: la app nunca guarda su ubicación.');
    set('note', notes.join(' '));
    paintDialogToggle(bird);
  }

  function paintDialogToggle(bird: HTMLButtonElement) {
    dialog.querySelector('[data-dialog-toggle]')!.textContent = isSeen(bird.dataset.bird!) ? 'Quitar de las que vi' : 'Ya la vi';
  }

  grid.addEventListener('click', (event) => {
    const bird = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-bird]');
    if (!bird) return;
    opened = bird;
    fillDialog(bird);
    dialog.showModal();
    pauseScroll();
  });

  dialog.querySelector('[data-dialog-toggle]')!.addEventListener('click', () => {
    if (!opened) return;
    setSeen(opened.dataset.bird!, !isSeen(opened.dataset.bird!));
    paintDialogToggle(opened);
  });

  dialog.querySelector('[data-dialog-close]')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    resumeScroll();
    opened?.focus();
  });

  more.addEventListener('click', () => {
    expanded = true;
    applyFilters();
    birds[24]?.focus({ preventScroll: true });
  });

  search.addEventListener('input', applyFilters);
  habitat.addEventListener('change', applyFilters);
  seenFilter.addEventListener('change', applyFilters);
  onSeenChange(() => {
    paintSeen();
    if (seenFilter.value) applyFilters();
  });

  paintSeen();
  applyFilters();
}
