<script lang="ts">
	import '$lib/css/global.scss';
	import favicon from '$lib/assets/favicon.svg?url';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Amarante&family=Rosario:ital,wght@0,300..700;1,300..700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
