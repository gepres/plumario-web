# Plumario web

Sitio público de [Plumario](../plumario-app), el álbum de las aves de Ica. La portada es una página
del álbum: los stickers se despegan y se pegan de verdad.

Stack: Astro, Tailwind, GSAP y Lenis. Se publica en Netlify, y la lista de espera usa Netlify Forms.

## Comandos

```bash
pnpm install
pnpm dev            # desarrollo
pnpm build          # genera dist/
pnpm check          # revisa los tipos
pnpm content:sync   # trae catálogo e ilustraciones desde ../plumario-app
```

## De dónde sale cada cosa

- **Aves, números y cromos:** `src/data/birds.json` y `public/stickers/` se generan con
  `pnpm content:sync`. No se editan a mano. Si cambia el catálogo de la app, se vuelve a correr.
- **Regla de categorías de cromo:** copia de `categoryOf` en `packages/core/src/domain/card.ts` de
  la app. Si allá cambia, hay que cambiarla en `scripts/sync-content.mjs`.
- **Colores:** paleta F · Ribera de la app, en `src/styles/global.css`.
- **Sticker, acabados y medalla:** replican `bird-sticker.tsx`, `sticker-finishes.ts` y `medal.tsx`
  de `@plumario/ui`.
- **Pantallas del teléfono:** HTML en `src/components/Phone.astro`, armado desde los artboards de la
  app con las ilustraciones reales.
- **Imagen para compartir:** `node scripts/make-og.mjs`, con `pnpm dev` corriendo en el puerto 4329.

## Reglas

- La web solo promete lo que la app hace; las cifras salen del catálogo.
- Lo impreso va plano y sin sombra. Solo los stickers tienen sombra.
- Código en inglés; comentarios y textos en español.
- Toda interacción tiene alternativa por teclado y respeta `prefers-reduced-motion`.
- Las skills de `.claude/skills/` son de GreenSock, Anthropic, Vercel y la comunidad de Astro.
