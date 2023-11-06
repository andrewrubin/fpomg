<script>
	import { afterNavigate } from '$app/navigation';

	afterNavigate(() => {
		PayPal.Donation.Button({
			env: 'production',
			hosted_button_id: 'ECMDZR6C7KKYW',
			image: {
				// this is a 1x1 transparent png, because paypal
				// requires there to be an image in the donate button:
				src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
				alt: '',
			},
		}).render('#donate-button');
	});
</script>

<footer class="footer">
	<div class="footer__donate" id="donate-button">
		<span>Donate</span>
	</div>
</footer>

<style lang="scss">
	// the donate button image needs to be in the global scope,
	// as it's generated after runtime
	:global(img#donate-button) {
		top: 0;
		left: 0;
		height: 100%;
		position: absolute;
		width: 100%;
	}

	@mixin highlight {
		color: var(--color-highlight);
	}

	.footer {
		background-color: var(--color-dark-200);
		display: flex;
		justify-content: center;
		margin-top: auto;
	}

	.footer__donate {
		line-height: 1;
		padding: 16px 40px;
		position: relative;

		@media (hover: hover) {
			&:hover {
				@include highlight;
			}
		}

		&:active {
			@include highlight;
		}
	}
</style>
