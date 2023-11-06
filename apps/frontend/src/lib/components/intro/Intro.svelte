<script>
	import { assets } from '$app/paths';
	import CopyField from '../copy-field/CopyField.svelte';

	let examples = [
		{ label: 'basic', url: 'fpomg.com/600/400' },
		{ label: 'custom color', url: 'fpomg.com/600/400/9932cc' },
		{ label: 'custom text', url: 'fpomg.com/600/400/?text=santa' },
	];
</script>

<div class="intro">
	<header class="wrapper">
		<h1>
			<img src={`${assets}/logo-fpomg.svg`} alt="FPOMG" />
			<span class="block txt-body-larger">the URL-based FPO image generator</span>
		</h1>
	</header>

	<div class="examples">
		<ul class="row examples__list">
			{#each examples as example}
				<li class="col col--4 examples__item">
					<span class="examples__label txt-body-larger block">{example.label}</span>
					<CopyField url={example.url} />
				</li>
			{/each}
		</ul>
	</div>
</div>

<style lang="scss">
	@use '../../styles/helpers' as h;
	@use '../../styles/breakpoints' as breaks;

	.intro {
		display: flex;
		flex-direction: column;
		height: max(100vh, 800px);
		justify-content: center;
	}

	header {
		margin-bottom: auto;
		margin-top: auto;
		text-align: center;
		width: 100%;

		span {
			line-height: 1.4;
			margin-top: 1em;
		}
	}

	img {
		display: block;
		margin: auto;
		width: min(80%, 528px);
	}

	.examples {
		--item-margin: #{h.space-by(2.5)};
		--section-pad: #{h.space-by(3)};

		background-color: var(--color-dark-200);
		padding: var(--section-pad) 0 calc(var(--section-pad) - var(--base-space));
	}

	.examples__list {
		flex-wrap: wrap;
		list-style-type: none;
	}

	.examples__label {
		--left-pad: #{h.space-by(2)};

		margin-bottom: h.space-by(1.5);
		padding-left: var(--left-pad);
	}

	.examples__item {
		margin-bottom: var(--item-margin);
	}

	@media #{breaks.$medium-up} {
		.examples {
			--section-pad: #{h.space-by(4)};
		}

		.examples__item {
			flex-grow: 1;
		}

		.examples__label {
			--left-pad: #{h.space-by(3)};
		}
	}

	@media screen and (min-width: 768px) {
		.examples__item {
			&:last-child {
				flex-grow: 0;
			}
		}
	}

	@media #{breaks.$large-up} {
		.examples {
			--section-pad: #{h.space-by(5)};
		}
	}
</style>
