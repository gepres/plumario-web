import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;

// El scroll suave solo con ratón o trackpad: en pantallas táctiles manda el sistema.
if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
  lenis = new Lenis({ autoRaf: false, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function pauseScroll() {
  lenis?.stop();
}

export function resumeScroll() {
  lenis?.start();
}

export { gsap, ScrollTrigger };
