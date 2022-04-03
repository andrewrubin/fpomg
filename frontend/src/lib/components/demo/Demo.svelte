<script>
	import CopyButton from '../copy-button/CopyButton.svelte';
	const placeholder = 'fpomg.com/600/400';
	const inputFetchDelay = 500;
	let inputValue = '';
	let imageSource = `https://${placeholder}`;
	let imageError = false;

	let inputTimer = null;
	const handleInput = (e) => {
		if (inputTimer) clearTimeout(inputTimer);
		inputTimer = setTimeout(() => {
			if (inputValue.indexOf('fpomg.com') < 0) return;
			imageError = false;
			imageSource = inputValue.indexOf('https://') > -1 ? inputValue : `https://${inputValue}`;
		}, inputFetchDelay);
	};

	const handleError = () => {
		imageError = true;
	};
</script>

<section class="demo">
	<div class="row">
		<div class="col col--6 col--lrg-5">
			<div class="playground">
				<label for="tryit">
					<span class="block txt-body-jumbo">try it:</span>
				</label>
				<input
					type="text"
					id="tryit"
					{placeholder}
					bind:value={inputValue}
					on:input={handleInput}
				/>
				<CopyButton text={imageSource} disabled={imageError} />
			</div>
		</div>
		<div class="col col--6 col--lrg-5">
			{#if imageError}
				<p>invalid image URL!</p>
			{:else}
				<img class="result block fit" src={imageSource} alt="FPO" on:error={handleError} />
			{/if}
		</div>
	</div>
</section>

<style lang="scss">
	@use '../../styles/helpers' as *;

	.demo {
		--corners: 16px;

		background-color: var(--color-dark-400);
		padding: 140px 0 125px;
	}

	.playground {
		background-color: var(--color-dark-300);
		border: 1px solid var(--color-dark-100);
		border-radius: var(--corners);
		padding: space-by(4) space-by(5);
	}

	input {
		-moz-appearance: none;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		border: 0;
		border-bottom: 3px solid var(--color-light-100);
		color: var(--color-light-100);
		display: block;
		font-family: inherit;
		font-size: 24px;
		padding: 0.4em 0.4em;
		width: 100%;
	}

	.result {
		border-radius: var(--corners);
	}
</style>
