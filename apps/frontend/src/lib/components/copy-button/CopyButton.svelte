<script>
	import CopyIcon from '../copy-icon/CopyIcon.svelte';
	export let text;
	export let disabled;
	export let iconOnly;
	export let color;

	const handleClick = async () => {
		await navigator.clipboard.writeText(text);
	};
</script>

<button class="copy-button" {disabled} on:click={handleClick}>
	<CopyIcon {color} />
	{#if !iconOnly}
		Copy URL to clipboard
	{/if}
</button>

<style lang="scss">
	button {
		--easing: cubic-bezier(0.66, 0.35, 0.33, 1.56);
		--duration: 0.4s;

		align-items: center;
		display: flex;
		gap: 0.5em;
		text-align: left;
		transform: scale(var(--scale, 1)) translateY(var(--y, 0));
		transition: transform var(--duration) var(--easing);

		&[disabled] {
			opacity: 0.3;
			cursor: not-allowed;
		}

		&:active {
			--duration: 0.05s;
			--easing: linear;
			--scale: 0.8;
		}
	}
</style>
