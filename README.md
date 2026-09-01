# aqua — Priyanshu’s portfolio as Mac OS X

Aqua desktop portfolio — Mac OS X 10.0 rebuilt with authentic boot,  menubar, and draggable Finder windows for skills/projects. Migrated to **Next.js 15 + Bun**.

![Aqua](public/assets/aqua-blue.jpg)

## Run

```bash
bun install
bun dev        # http://localhost:3000
bun run build && bun start
```

Boot: authentic iMac G3 chime (`public/assets/startup.wav`), large  + “Mac OS X” on pinstripe panel. Mute with `?sound=0`, skip boot `?boot=0`, slow `?boot=slow`.

## Stack

Next.js 15 (App Router, Turbopack), React 19, TypeScript, `public/assets` + Aqua CSS (`src/app/aqua.css` / `desktop.css` / `portfolio.css`), Web Components (`public/packages/web-components`).

## Credits

- Aqua UI scaffold: [willmeyers/aqua-ui](https://github.com/willmeyers/aqua-ui) (MIT) — `aqua.css`, `desktop.css`, `boot.js`, icons, `packages/web-components`
- Content from `ego1s1/landing`
- Startup chime: iMac G3

License: MIT (see `LICENSE.aqua` for Aqua UI).
