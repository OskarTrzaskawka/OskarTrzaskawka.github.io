# Contributing to Persona Folio

Thanks for wanting to help! New templates, sections and persona presets are the most welcome contributions.

Questions before you start? Say hi on the **[Discord support server](https://discord.com/invite/U5fzuzbgkF)**.

## Setup

```bash
git clone https://github.com/OskarTrzaskawka/persona-folio.git
cd persona-folio
npm install
npm run dev                # developer persona
npm run dev:designer       # or any other persona
npx vite --mode showcase   # all personas + switcher
```

Requires Node.js 22+.

## Project map

| Path | What lives there |
| --- | --- |
| `src/personas/*.ts` | Content. One file = one portfolio. Pure data, no JSX. |
| `src/core/types.ts` | The persona schema. Start here when adding a section. |
| `src/core/env.ts` | Every `.env` override. |
| `src/core/templates.ts` | Template metadata (fonts, default scheme, theme color). |
| `src/styles/templates.css` | Template tokens (colors, type) and per-template overrides. |
| `src/sections/` | Section components + the registry in `index.tsx`. |
| `src/components/` | Hero variants, nav, footer, command palette, primitives. |
| `plugins/persona.ts` | Vite plugin: persona resolution, SEO tags, sitemap, manifest. |

## Adding a section type

1. Add an interface to `src/core/types.ts` and include it in the `Section` union.
2. Create the component in `src/sections/` (props: `{ section, index }`).
3. Register it in `src/sections/index.tsx`.
4. Use it in at least one demo persona and document it in the README.

## Adding a template

1. Add the id to `TemplateId` and metadata to `src/core/templates.ts`.
2. Add tokens for both `[data-scheme='dark']` and `[data-scheme='light']` in `templates.css`.
3. Optionally add a hero variant in `src/components/Hero.tsx`.
4. Add a demo persona and a `.env.<id>` file.

## Guidelines

- Every visual change must work in **light and dark**, on **mobile**, and with **reduced motion**.
- Keep personas pure data so the Vite plugin can read them at build time.
- No trackers, no cookies, no secrets in `VITE_*` variables (they are public).
- Run `npm run lint && npm run typecheck` before opening a PR.
- Regenerate screenshots with `npm run screenshots` if you changed visuals.

Please keep the author credit in the footer — it helps the project grow. ♥
