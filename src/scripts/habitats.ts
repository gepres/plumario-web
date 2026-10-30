import { gsap } from './motion';

type Poster = { numbers: number[]; sample: Record<string, string> };

const root = document.querySelector<HTMLElement>('[data-habitats]');

if (root) {
  const poster = root.querySelector<HTMLElement>('[data-poster]')!;
  const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!;
  const name = root.querySelector<HTMLElement>('[data-poster-name]')!;
  const place = root.querySelector<HTMLElement>('[data-poster-place]')!;
  const status = root.querySelector<HTMLElement>('[data-poster-status]')!;
  const range = root.querySelector<HTMLInputElement>('[data-habitat-range]')!;
  const output = root.querySelector<HTMLOutputElement>('[data-habitat-output]')!;
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[name="habitat"]')];
  const posters = JSON.parse(root.querySelector('[data-posters]')!.textContent!) as Record<string, Poster>;

  let total = 0;
  let fillable: HTMLImageElement[] = [];

  function paintProgress() {
    const value = Number(range.value);
    fillable.forEach((image, index) => {
      const filled = index < value;
      image.src = filled ? image.dataset.art! : image.dataset.shadow!;
      image.parentElement!.toggleAttribute('data-filled', filled);
    });
    output.value = `${value} de ${total} especies`;
    range.setAttribute('aria-valuetext', output.value);
    status.textContent =
      value === fillable.length ? `Hasta aquí la muestra. Las otras ${total - value} se desbloquean en la app.` : 'Plumario, edición Ica';
  }

  function showHabitat(input: HTMLInputElement) {
    const { numbers, sample } = posters[input.value]!;
    total = numbers.length;
    // Las columnas salen del alto que dejan el título y el pie (1,2 veces el ancho), para que
    // cualquier cantidad de aves quepa en el póster.
    poster.style.setProperty('--columns', String(Math.ceil(Math.sqrt(total / 1.2))));
    poster.style.setProperty('--tint', input.dataset.tint!);
    poster.style.setProperty('--habitat', input.dataset.color!);
    name.textContent = input.dataset.name!;
    place.textContent = input.dataset.place!;

    const images = numbers.map((number) => {
      const image = document.createElement('img');
      image.dataset.shadow = `/stickers/shadow/${String(number).padStart(3, '0')}.webp`;
      image.src = image.dataset.shadow;
      image.alt = '';
      image.width = 240;
      image.height = 240;
      image.loading = 'lazy';
      image.decoding = 'async';
      const bird = sample[number];
      if (bird) {
        image.dataset.art = `/stickers/160/${bird}.webp`;
        new Image().src = image.dataset.art;
      }
      return image;
    });
    grid.replaceChildren(
      ...images.map((image) => {
        const item = document.createElement('li');
        item.append(image);
        return item;
      }),
    );

    fillable = gsap.utils.shuffle(images.filter((image) => image.dataset.art));
    range.max = String(fillable.length);
    range.value = String(Math.ceil(fillable.length / 2));
    paintProgress();
  }

  range.addEventListener('input', paintProgress);
  for (const input of inputs) input.addEventListener('change', () => showHabitat(input));
  const initial = inputs.find((input) => input.checked);
  if (initial) showHabitat(initial);
}
