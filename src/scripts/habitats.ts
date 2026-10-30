import { gsap } from './motion';

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

  // Las aves salen del álbum, que ya las trae en el HTML: así no se repiten los datos.
  const album = [...document.querySelectorAll<HTMLElement>('[data-bird]')];
  let fillOrder: HTMLElement[] = [];

  function paintProgress() {
    const value = Number(range.value);
    const total = Number(range.max);
    fillOrder.forEach((item, index) => item.toggleAttribute('data-filled', index < value));
    output.value = `${value} de ${total} especies`;
    range.setAttribute('aria-valuetext', output.value);
    status.textContent = value === total ? 'Póster completo: listo para descargar en A3.' : 'Plumario, edición Ica';
  }

  function showHabitat(input: HTMLInputElement) {
    const species = album.filter((bird) => bird.dataset.habitat === input.value);
    // Las columnas salen del alto que dejan el título y el pie (1,2 veces el ancho), para que
    // cualquier cantidad de aves quepa en el póster.
    const columns = Math.ceil(Math.sqrt(species.length / 1.2));
    poster.style.setProperty('--columns', String(columns));
    poster.style.setProperty('--tint', input.dataset.tint!);
    poster.style.setProperty('--habitat', input.dataset.color!);
    name.textContent = input.dataset.name!;
    place.textContent = input.dataset.place!;

    grid.replaceChildren(
      ...species.map((bird) => {
        const item = document.createElement('li');
        const image = document.createElement('img');
        image.src = `/stickers/160/${bird.dataset.bird}.webp`;
        image.alt = '';
        image.width = 160;
        image.height = 160;
        image.loading = 'lazy';
        image.decoding = 'async';
        item.append(image);
        return item;
      }),
    );
    // Se llena salteado, como un álbum de verdad.
    fillOrder = gsap.utils.shuffle([...grid.children] as HTMLElement[]);
    range.max = String(species.length);
    range.value = String(Math.round(species.length / 3));
    paintProgress();
  }

  range.addEventListener('input', paintProgress);
  for (const input of inputs) input.addEventListener('change', () => showHabitat(input));
  const initial = inputs.find((input) => input.checked);
  if (initial) showHabitat(initial);
}
