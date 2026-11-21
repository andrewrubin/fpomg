<script>
	import { assets, base } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page not found' : `Error ${page.status}`} | fpomg</title>
</svelte:head>

<main class="error wrapper">
	<a class="error__logo" href={`${base}/`}>
		<img src={`${assets}/logo-fpomg.svg`} alt="FPOMG" />
		<span class="visually-hidden">homepage</span>
	</a>

	<div class="error__message content-flow">
		{#if page.status === 404}
			<h1 class="txt-body-jumbo">The URL you entered isn't valid.</h1>
			<p class="txt-body-larger">Check out the homepage for examples.</p>
		{:else}
			<h1 class="txt-body-jumbo">Something went wrong.</h1>
			<p class="txt-body-larger">
				Error {page.status}{page.error?.message ? `: ${page.error.message}` : ''}
			</p>
		{/if}
	</div>

	<a class="error__home txt-body-larger" href={`${base}/`}>Go to the homepage</a>
</main>

<style lang="scss">
	@use '../lib/styles/helpers' as h;

	@mixin filled {
		background-color: var(--color-highlight);
		color: var(--color-text-dark);
	}

	.error {
		align-items: center;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: h.space-by(5);
		justify-content: center;
		padding-block: h.space-by(8);
		text-align: center;
		width: 100%;
	}

	.error__logo {
		display: block;
		width: min(60%, 360px);

		img {
			display: block;
			width: 100%;
		}
	}

	.error__message {
		h1,
		p {
			line-height: 1.4;
		}

		p {
			color: var(--color-text-muted);
		}
	}

	.error__home {
		border: 2px solid var(--color-highlight);
		border-radius: 999px;
		color: var(--color-text-light);
		line-height: 1;
		padding: h.space-by(2) h.space-by(4);
		text-decoration: none;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;

		@media (hover: hover) {
			&:hover {
				@include filled;
			}
		}

		&:active {
			@include filled;
		}

		&:focus-visible {
			@include filled;

			outline: 2px solid var(--color-light-100);
			outline-offset: 4px;
		}

		@media (prefers-reduced-motion: reduce) {
			transition: none;
		}
	}
</style>
