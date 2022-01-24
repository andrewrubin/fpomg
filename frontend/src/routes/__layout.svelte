<script>
	import Intro from '$lib/components/intro/Intro.svelte';
	import Footer from '$lib/components/footer/Footer.svelte';
	import '../app.scss';
</script>

<Intro />

<main>
	<slot />
</main>

<Footer />
