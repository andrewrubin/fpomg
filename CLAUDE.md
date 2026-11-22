# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FPOMG is a URL-based placeholder ("FPO") image API: `GET /<width>/<height>/<hexcolor>?text=...` returns a PNG. It's an npm-workspaces monorepo deployed as a single Cloudflare Worker:

- `apps/worker`: the Cloudflare Worker. It renders images with `@resvg/resvg-wasm` (SVG → PNG) and serves the frontend as static assets.
- `apps/frontend`: SvelteKit 2 / Svelte 5 site, fully prerendered (`adapter-static`) to `apps/frontend/build`. The components still use Svelte 4 syntax (`export let`, `on:`), which Svelte 5 runs in legacy mode.

Node 22+. Install with npm 11 (`npx npm@11 install`): npm 10 crashes (`Cannot read properties of null (reading 'edgesOut')`) resolving Vitest's circular optional peer deps.

## Commands

From the repo root:

```bash
npm run dev      # build frontend, then wrangler dev at http://localhost:8787
npm test         # build frontend (wrangler.jsonc needs apps/frontend/build), then vitest inside workerd
npm run deploy   # build frontend, then wrangler deploy
npm run build    # frontend only
npm run lint     # prettier --check everywhere + eslint (frontend); must pass
npm run format   # prettier --write everywhere
```

Single test file / test: `npx vitest run test/image.test.js -t "escapes XML"` from `apps/worker` (requires `apps/frontend/build` to exist).

Prettier configs differ per app: the frontend uses `apps/frontend/.prettierrc` (tabs, single quotes, width 100, svelte plugin); the worker and root files use Prettier defaults (2 spaces, double quotes, width 80). ESLint is configured only for the frontend.

## Architecture

**Routing** (`apps/worker/wrangler.jsonc`): Workers Static Assets serves `../frontend/build`, and static files are served _before_ the Worker runs, so `/` and `/_app/...` never reach `src/index.js`. With `not_found_handling: "404-page"`, the asset layer answers **browser navigations** that match no file with `404.html` _without running the Worker_. So `run_worker_first: ["/*/*", "!/_app/*"]` sends every multi-segment path (which includes every image URL) to the Worker first. If the build ever gains another nested folder besides `_app/`, add a `!/<folder>/*` exclusion. Paths that aren't image routes fall back to `env.ASSETS.fetch()`, which returns `404.html` (adapter-static's `fallback`, showing SvelteKit's error page) with a 404 status.

The vitest tests call the Worker directly and **skip asset routing**, so they can't catch routing regressions. After changing `wrangler.jsonc` or the build output, check with `wrangler dev`, sending both plain requests and browser-navigation requests (`-H "Sec-Fetch-Mode: navigate" -H "Accept: text/html"`) for `/`, an image URL, a `/_app/` file and an unknown path.

**Image pipeline**: `index.js` calls `normalizeOptions` (`create-image.js`), which validates dimensions (1 to `MAX_DIMENSION` = 2000), color, and text length (at most `MAX_TEXT_LENGTH` = 200 characters, counted as code points), and normalizes them. Validation errors become `400` text responses; render failures are logged and return a generic `500`. `createImage` takes the _normalized_ options (it doesn't re-validate). It picks black or white text by W3C perceived brightness (`get-foreground-color.js`), substitutes `${width}`/`${height}`, strips XML-illegal characters and characters the font has no glyph for, lays out the text, builds an SVG (one `<text>` per line, XML-escaped) and renders it with `fitTo: original`, so the output is exactly w×h pixels. All responses, errors included, send `Access-Control-Allow-Origin: *`.

**Text layout** (`layout-text.js`, `font-metrics.js`): resvg can't wrap or measure text, so `font-metrics.js` reads glyph advance widths straight from the TTF (cmap formats 4/12 plus hmtx). It ignores kerning, so `measure` is linear in font size and additive across strings. `layoutText` relies on that: it measures each word once at 1px and tracks line widths incrementally. Ignoring kerning measured 1.5–4% _wider_ than rendered in tests, so lines usually wrap a little early; the padding absorbs any rare kerning pair that widens text. `layoutText` starts at `w * 0.08`, wraps greedily on whitespace inside 6% side/top padding, and shrinks the font until the block fits. It breaks words mid-word only below the 8px minimum. Tune the layout with the constants at the top of `layout-text.js`.

**Font and WASM loading**: `Montserrat-Bold.ttf` is bundled as a `Data` module and the resvg `.wasm` as a `CompiledWasm` module (the `rules` in `wrangler.jsonc`). Nothing is fetched at runtime. `initWasm` runs once per isolate via the module-scoped `ready` promise. Montserrat covers Latin, Cyrillic and Vietnamese. With system fonts off, other characters (CJK, emoji) would render as nothing, so `createImage` drops them before layout.

**Caching**: `index.js` uses `caches.default` with a key built only from the normalized options plus `RENDER_VERSION` (`/w/h/color?v=N&text=`), so junk query params or spellings like `0600`/`B4D455` can't bypass it. **Bump `RENDER_VERSION` in `create-image.js` whenever rendered output changes** (font, layout constants, drawing). Otherwise the edge keeps serving old images. `Cache-Control: public, max-age=86400, s-maxage=31536000`: a year at the edge, a day in browsers, so after a version bump browsers pick up new images within a day. The Cache API only stores GETs, so the key is always a GET request; HEAD requests read and write that entry and always return no body. The Cache API does nothing on `*.workers.dev`; it only works on a custom domain. Locally, `wrangler dev` stores cached responses in `apps/worker/.wrangler/state`, so delete that folder after changing image output or you'll be served stale images.

## Constraints

- **Free-plan CPU limit (10ms/request)**: uncached renders cost about 4ms at 300×250, 8ms at 600×400 (about 9.5ms with several lines of wrapped text, about 15ms with 200 characters), 13–15ms at 800×600, 50ms at 1920×1080, and up to about 110ms at 2000×2000 with 200 characters. So large uncached images can exceed the limit. Output is PNG because JPEG encoding (MozJPEG/jpeg-js in WASM) cost 12–25ms even at 600×400. Rerun timing whenever you change the render path.
- Bundle is about 1.1 MB gzipped (free-plan limit 3 MB). The resvg WASM is most of it. Check with `npx wrangler deploy --dry-run --outdir <dir>` from `apps/worker`.
- `@sveltejs/kit` 2.x has `npm audit` advisories. They affect SvelteKit's server runtime, which this static-only site doesn't use; the fix is SvelteKit 3.

## Conventions

- Commit messages follow Conventional Commits (`build(frontend): ...`, `docs: ...`).
