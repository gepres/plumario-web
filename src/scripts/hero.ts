import { Draggable } from 'gsap/Draggable';
import { Flip } from 'gsap/Flip';

import { setSeen } from './album-store';
import { gsap, reducedMotion } from './motion';

gsap.registerPlugin(Draggable, Flip);

const hero = document.querySelector<HTMLElement>('[data-hero]');
if (hero) setUpHero(hero);

function setUpHero(root: HTMLElement) {
  const total = Number(root.dataset.total);
  const verb = root.querySelector<HTMLElement>('[data-hero-verb]')!;
  const missing = root.querySelector<HTMLElement>('[data-hero-missing]')!;
  const status = root.querySelector<HTMLElement>('[data-hero-status]')!;
  const stickers = [...root.querySelectorAll<HTMLButtonElement>('[data-sticker]')];
  // El titular pide las aves en el orden en que se escribieron en la portada.
  const pending = [...stickers].sort((a, b) => order(a) - order(b));
  const pasted = new Set<HTMLButtonElement>();
  let lastDragAt = 0;

  function order(sticker: HTMLButtonElement) {
    return ['el flamenco.', 'el pelícano.', 'el pingüino.', 'el zarcillo.', 'el cóndor.', 'la cometa.'].indexOf(sticker.dataset.phrase!);
  }

  function slotOf(sticker: HTMLButtonElement) {
    return root.querySelector<HTMLElement>(`[data-slot="${sticker.dataset.sticker}"]`)!;
  }

  function say(message: string, tone?: 'win') {
    status.textContent = message;
    if (tone) status.dataset.tone = tone;
    else delete status.dataset.tone;
  }

  function rollHeadline(text: string, verbText?: string) {
    if (reducedMotion) {
      missing.textContent = text;
      if (verbText) verb.textContent = verbText;
      return;
    }
    gsap
      .timeline()
      .to(missing, { yPercent: -110, duration: 0.22, ease: 'power2.in' })
      .call(() => {
        missing.textContent = text;
        if (verbText) verb.textContent = verbText;
      })
      .fromTo(missing, { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: 'back.out(1.5)' });
  }

  function updateAfterPaste() {
    const count = pasted.size;
    const next = pending.find((sticker) => !pasted.has(sticker));
    if (next) {
      if (next.dataset.phrase !== missing.textContent) rollHeadline(next.dataset.phrase!);
    } else {
      rollHeadline(`${total - count} más.`, 'Me faltan');
    }
    if (count === 1) say('Ganaste tu primera medalla: Mi primera ave.', 'win');
    else if (count === 5) say('Medalla nueva: Explorador de Ica.', 'win');
    else if (count === stickers.length) say('Página completa. En la app, cada sticker se gana con una foto tuya.', 'win');
    else say(`Llevas ${count} de ${total}.`);
  }

  function burst(target: HTMLElement) {
    if (reducedMotion) return;
    const box = target.getBoundingClientRect();
    const originX = box.left + box.width / 2;
    const originY = box.top + box.height / 2;
    for (let i = 0; i < 8; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      document.body.append(spark);
      const angle = (i / 8) * Math.PI * 2 + gsap.utils.random(-0.3, 0.3);
      const distance = box.width * gsap.utils.random(0.65, 1);
      gsap.fromTo(
        spark,
        { x: originX - 8, y: originY - 8, scale: gsap.utils.random(0.5, 1.2), rotation: 0 },
        {
          x: originX - 8 + Math.cos(angle) * distance,
          y: originY - 8 + Math.sin(angle) * distance,
          scale: 0,
          rotation: 120,
          duration: 0.7,
          ease: 'power3.out',
          onComplete: () => spark.remove(),
        },
      );
    }
  }

  function paste(sticker: HTMLButtonElement) {
    if (pasted.has(sticker)) return;
    pasted.add(sticker);
    const slot = slotOf(sticker);
    const focused = document.activeElement === sticker;
    Draggable.get(sticker)?.kill();

    const state = Flip.getState(sticker);
    gsap.set(sticker, { clearProps: 'transform,zIndex' });
    slot.append(sticker);
    sticker.disabled = true;
    sticker.setAttribute('aria-label', `${sticker.dataset.name}, ya en el álbum`);
    Flip.from(state, {
      duration: reducedMotion ? 0 : 0.5,
      ease: 'back.out(1.7)',
      zIndex: 30,
      onComplete: () => burst(slot),
    });

    setSeen(sticker.dataset.sticker!, true);
    updateAfterPaste();
    if (focused) stickers.find((candidate) => !pasted.has(candidate))?.focus();
  }

  function goBack(sticker: HTMLButtonElement) {
    gsap.to(sticker, { x: 0, y: 0, rotation: restingTilt(sticker), scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.65)' });
  }

  function restingTilt(sticker: HTMLButtonElement) {
    return Number.parseFloat(sticker.style.getPropertyValue('--tilt'));
  }

  // Se mira el puntero, no el sticker: al soltar rápido, el sticker va un fotograma atrás.
  function slotUnderPointer(x: number, y: number) {
    return [...root.querySelectorAll<HTMLElement>('[data-slot]')].find((slot) => {
      const area = slot.getBoundingClientRect();
      return x > area.left && x < area.right && y > area.top && y < area.bottom;
    });
  }

  function warn(slot: HTMLElement) {
    slot.dataset.wrong = '';
    say(`Esa casilla es de ${slot.dataset.slotName}.`);
    gsap.fromTo(
      slot,
      { x: -5 },
      { x: 0, duration: 0.45, ease: 'elastic.out(1.2, 0.25)', onComplete: () => void delete slot.dataset.wrong },
    );
  }

  for (const sticker of stickers) {
    gsap.set(sticker, { rotation: restingTilt(sticker) });
    sticker.style.transform = '';
    const tiltTo = gsap.quickTo(sticker, 'rotation', { duration: 0.3, ease: 'power3' });

    Draggable.create(sticker, {
      type: 'x,y',
      minimumMovement: 4,
      dragClickables: true,
      allowContextMenu: false,
      onPress() {
        gsap.to(sticker, { scale: 1.1, duration: 0.18, ease: 'power2.out' });
      },
      onDrag() {
        // Se inclina hacia donde lo arrastran, como un papel recién despegado.
        tiltTo(gsap.utils.clamp(-16, 16, this.deltaX * 2));
        lastDragAt = performance.now();
      },
      onRelease() {
        if (performance.now() - lastDragAt > 150) gsap.to(sticker, { scale: 1, duration: 0.15 });
      },
      onDragEnd() {
        lastDragAt = performance.now();
        const slot = slotUnderPointer(this.pointerX - window.scrollX, this.pointerY - window.scrollY);
        if (slot?.dataset.slot === sticker.dataset.sticker) {
          paste(sticker);
        } else {
          if (slot) warn(slot);
          goBack(sticker);
        }
      },
    });

    // Un toque, Enter o Espacio lo llevan a su casilla: es la alternativa al arrastre.
    sticker.addEventListener('click', () => {
      if (performance.now() - lastDragAt > 150) paste(sticker);
    });
  }

  // El único momento coreografiado de la página: los stickers caen sobre el álbum.
  const loose = stickers.map((sticker) => {
    sticker.dataset.ready = '';
    return sticker;
  });
  if (!reducedMotion) {
    gsap.from(loose, {
      y: -140,
      scale: 1.5,
      rotation: (index) => (index % 2 ? 24 : -24),
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.09,
      ease: 'back.out(1.3)',
      delay: 0.15,
    });
  }
}
