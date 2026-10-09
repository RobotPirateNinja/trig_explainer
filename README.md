# Sine, Cosine & Tangent explainer

The first app in the *Explainers for Titus* series: an interactive, kid-friendly
page (ages 8–10) about sine, cosine and tangent. Plain Vite + vanilla JS, no framework.

## Run it

```sh
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the built dist/
```

## Deploy (Netlify)

`netlify.toml` already sets the build command (`npm run build`) and publish
folder (`dist`). Point a Netlify site at this folder (or its Git repo) and it
builds with no extra settings.

## What's on the page

1. **Meet the right triangle**: drag the corner (or use the sliders) to change the
   angle θ and the size. Live side lengths and the three ratios, with SOH CAH TOA.
   Changing only the size shows the ratios stay the same.
2. **Riding the circle**: the unit circle as a Ferris wheel. Sine is the height,
   cosine the sideways distance; the dot draws the sine (and optional cosine) wave,
   and an optional tangent line shows where "tangent" gets its name.
3. **How they're connected**: tan = sin ÷ cos, sin θ = cos(90° − θ),
   sin² + cos² = 1, and the sine/cosine seesaw.
4. **Missions**: small goals that tick themselves off.
5. **Word bank**: every word, generated from the glossary.

Colours are fixed per idea everywhere: sine/opposite red, cosine/adjacent blue,
tangent green, hypotenuse purple, angle orange.

## Reusing the pieces in the next explainer

Everything in `src/shared/` is topic-free and meant to be copied (or later turned
into a shared package) for the other explainers:

- `glossary.js`: `defineTerms({...})` registers words; `term(id, label)` and
  `{{id}}` / `{{id|label}}` markers (in any element with `data-linkify`, or via
  `linkify()`) turn words into clickable terms; `renderGlossary(el)` builds a Word Bank.
- `tooltip.js`: `initTooltips()` once per page. Any HTML or SVG element with
  `data-term="id"` gets a bubble on hover, tap or keyboard focus. Words inside a
  bubble are clickable too, with a Back button.
- `explainer.css`: page base, term underline, the bubble and Word Bank cards.

A new explainer needs its own `terms.js` (word list), its page and diagrams.
Each glossary entry can have `word`, `say` (pronunciation), `short` (symbol),
`def`, `example` and `origin` (word story).

## Node version

This project uses **Vite 6**, which runs on Node 18 or newer. (Vite 7 and 8 need
Node 20.19+ or 22.12+; on older Node, npm silently skips their native bundler and
`npm run dev` fails with "Cannot find native binding".)

## Installable app and link previews

- `public/manifest.webmanifest` plus the icons in `public/icons/` and
  `public/apple-touch-icon.png` let phones and Chrome "install" the page.
- `public/og-image.png` (1200×630) is the picture shown when the link is shared.
  Social sites need its full web address, so `vite.config.js` fills it in from
  Netlify's `URL` setting at build time. To use a custom domain, set
  `VITE_SITE_URL` (for example `https://trig.example.com`) in Netlify.

## License

[MIT](LICENSE)
