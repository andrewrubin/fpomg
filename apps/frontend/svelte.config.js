import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// Served by the Worker's static assets for unknown paths (not_found_handling: "404-page").
			fallback: '404.html',
			precompress: false,
			strict: true,
		}),
	},
	preprocess: vitePreprocess(),
};

export default config;
