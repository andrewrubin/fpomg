<script>
	import CopyIcon from '../copy-icon/CopyIcon.svelte';
	export let text;
	export let disabled;

	const handleClick = async (e) => {
		await navigator.clipboard.writeText(text);
	};
</script>

<button class="copy-button" {disabled} on:click={handleClick}>
	<CopyIcon color="#ff00b4" />
	Copy URL to clipboard
</button>

<style lang="scss">
	button[disabled] {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
