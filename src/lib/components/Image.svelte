<script lang="ts">
	import { images } from '$lib/assets/img';
	import { standardAttributes } from './standardattributes';

	let { src, alt = '', ...rest }: { src: string; alt?: string } = $props();

	const normalizedSrc = $derived(src.startsWith('/') ? src : `/${src}`);
	const url = $derived(images.get(normalizedSrc));
</script>

{#if url}
	<img {...standardAttributes(rest, 'image')} src={url} {alt} />
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
