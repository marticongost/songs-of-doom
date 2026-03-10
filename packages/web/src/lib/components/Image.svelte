<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		image: {
			display: 'inline-block'
		},
		unknown: {
			outline: '2px solid red',
			padding: '1em'
		}
	});
</script>

<script lang="ts">
	import { images } from '$lib/assets/img';
	import { cx } from '@emotion/css';
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
	<img {...standardAttributes(attributes, styles.image)} src={url} {alt} />
{:else}
	<span class={cx(styles.image, styles.unknown)}></span>
{/if}
