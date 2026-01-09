<script lang="ts">
	import { images } from '$lib/assets/img';
	import { standardAttributes } from './standardattributes';

	export let src: string;
	export let alt: string = '';

	if (!src.startsWith('/')) {
		src = `/${src}`;
	}

	const url = images.get(src);
</script>

{#if url}
	<img {...standardAttributes($$props, 'image')} src={url} {alt} />
{:else}
	<span class="image unknown"></span>
{/if}

<style lang="scss">
	.image {
		display: inline-block;
	}
	.image.unknown {
		outline: 2px solid red;
		padding: 1em;
	}
</style>
