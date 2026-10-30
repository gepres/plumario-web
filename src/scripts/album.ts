import { pauseScroll, resumeScroll } from './motion';

const root = document.querySelector<HTMLElement>('[data-album]');
if (root) setUpAlbum(root);

function setUpAlbum(section: HTMLElement) {
  const grid = section.querySelector<HTMLElement>('[data-album-grid]')!;
  const dialog = section.querySelector<HTMLDialogElement>('[data-bird-dialog]')!;
  const image = dialog.querySelector<HTMLImageElement>('[data-dialog-image]')!;
  const art = dialog.querySelector<HTMLElement>('[data-dialog-art]')!;
  let opened: HTMLButtonElement | null = null;

  function set(key: string, text: string) {
    dialog.querySelector(`[data-dialog-${key}]`)!.textContent = text;
  }

  function fillDialog({ dataset }: HTMLButtonElement) {
    image.src = `/stickers/320/${dataset.bird}.webp`;
    art.style.background = dataset.tint!;
    set('name', dataset.name!);
    set('scientific', dataset.scientific!);
    set('number', String(dataset.number).padStart(3, '0'));
    set('habitat', dataset.habitatName!);
    set('category', dataset.category!);
    set('family', dataset.family!);
    const notes = [];
    if ('endemic' in dataset) notes.push('Endémica: solo vive en el Perú.');
    if ('threatened' in dataset) notes.push('Amenazada: la app nunca guarda su ubicación.');
    notes.push('En la app, este sticker se gana con una foto tuya.');
    set('note', notes.join(' '));
  }

  grid.addEventListener('click', (event) => {
    const bird = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-bird]');
    if (!bird) return;
    opened = bird;
    fillDialog(bird);
    dialog.showModal();
    pauseScroll();
  });

  dialog.querySelector('[data-dialog-close]')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector('[data-dialog-cta]')!.addEventListener('click', () => {
    // Va a la lista de espera: devolver el foco al sticker haría saltar la página de regreso.
    opened = null;
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    resumeScroll();
    opened?.focus();
  });
}
