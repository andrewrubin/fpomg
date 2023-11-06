<script>
	import CopyButton from '../copy-button/CopyButton.svelte';

	export let url;
</script>

<span class="copy-field">
	<pre class="txt-body-smaller">{url}</pre>
	<span class="button">
		<CopyButton text={url} iconOnly color="currentColor" />
	</span>
</span>

<style lang="scss">
	@use '../../styles/helpers' as h;
	@use '../../styles/breakpoints' as breaks;

	.copy-field {
		--left-pad: #{h.space-by(2)};

		align-items: center;
		background-color: var(--color-light-100);
		border-radius: 3em;
		color: var(--color-text-dark);
		display: flex;
		justify-content: space-between;
		line-height: 0.5;
		overflow: hidden;
		padding-left: var(--left-pad);
	}

	pre {
		line-break: anywhere;
	}

	.button {
		color: var(--color-light-300);
		padding: h.space-by(1.5) h.space-by(2);
		transition: color 0.1s;
	}

	@media (hover: hover) {
		.button:hover {
			color: var(--color-dark-300);
		}
	}

	@media #{breaks.$medium-up} {
		.copy-field {
			--left-pad: #{h.space-by(3)};
		}
	}
</style>
