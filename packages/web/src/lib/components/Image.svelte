<script lang="ts">
	import { images } from '$lib/assets/img';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		src: string;
		alt?: string;
	}

	const { src, alt = '', ...attributes }: Props = $props();
	const normalizedSrc = $derived(src.startsWith('/') ? src : `/${src}`);
	const url = $derived(images.get(normalizedSrc));
</script>

{#if url}
	<img {...standardAttributes(attributes, 'image')} src={url} {alt} />
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
