import { gsap, reducedMotion } from './motion';

const root = document.querySelector<HTMLElement>('[data-chromes]');

if (root) {
  const stage = root.querySelector<HTMLElement>('[data-chrome-stage]')!;
  const cards = [...root.querySelectorAll<HTMLElement>('[data-chrome]')];
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[name="chrome-category"]')];
  let active = cards[0];

  // Reposo: el cromo queda algo girado para que el brillo se note sin tocarlo.
  const REST = { rotationY: -14, rotationX: 6 };
  const pose = (card: HTMLElement) => ({
    x: gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' }),
    y: gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' }),
  });
  const poses = new Map(cards.map((card) => [card, pose(card)]));

  function light(card: HTMLElement, x: number, y: number) {
    card.style.setProperty('--px', x.toFixed(1));
    card.style.setProperty('--py', y.toFixed(1));
  }

  cards.forEach((card) => gsap.set(card, REST));

  stage.addEventListener('pointermove', (event) => {
    const box = stage.getBoundingClientRect();
    const x = gsap.utils.clamp(0, 1, (event.clientX - box.left) / box.width);
    const y = gsap.utils.clamp(0, 1, (event.clientY - box.top) / box.height);
    light(active, x * 100, y * 100);
    if (reducedMotion) return;
    const current = poses.get(active)!;
    current.x((x - 0.5) * 44);
    current.y((0.5 - y) * 32);
  });

  stage.addEventListener('pointerleave', () => {
    if (reducedMotion) return;
    const current = poses.get(active)!;
    current.x(REST.rotationY);
    current.y(REST.rotationX);
  });

  function select(next: HTMLElement) {
    if (next === active) return;
    const previous = active;
    active = next;
    if (reducedMotion) {
      previous.hidden = true;
      next.hidden = false;
      return;
    }
    gsap
      .timeline()
      .to(previous, { rotationY: 90, duration: 0.16, ease: 'power2.in', overwrite: 'auto' })
      .call(() => {
        previous.hidden = true;
        next.hidden = false;
      })
      .fromTo(next, { rotationY: -90 }, { rotationY: REST.rotationY, duration: 0.5, ease: 'back.out(1.6)', overwrite: 'auto' });
  }

  for (const input of inputs) {
    input.addEventListener('change', () => {
      const card = cards.find((candidate) => candidate.dataset.chrome === input.value);
      if (card) select(card);
    });
  }
}
