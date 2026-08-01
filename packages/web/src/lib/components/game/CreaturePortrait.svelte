<!--
	@component
	Displays a creature's card image as a circular portrait on the game map.

	@prop cardId - The card ID used to look up the card image.
	@prop size - Controls the circle dimensions (default: '2.5em').
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		wrapper: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0
		},
		image: {
			width: 'var(--creature-portrait-size, 2.5em)',
			height: 'var(--creature-portrait-size, 2.5em)',
			objectFit: 'cover',
			borderRadius: '50%',
			border: css.separators.regularBorder,
			display: 'block'
		},
		fallback: {
			width: 'var(--creature-portrait-size, 2.5em)',
			height: 'var(--creature-portrait-size, 2.5em)',
			borderRadius: '50%',
			border: css.separators.regularBorder,
			background: css.palette.ash,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: css.palette.darkOpium,
			fontFamily: css.fonts.text,
			fontSize: '0.6em'
		}
	});
</script>

<script lang="ts">
	import { images } from '$lib/assets/img';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** The card ID used to look up the card image. */
		cardId: string;
		/** Controls the circle dimensions (default: '2.5em'). */
		size?: string;
	}

	const { cardId, size = '2.5em', ...attributes }: Props = $props();

	const imageSrc = $derived(`cards/${cardId}.jpg`);
	const imageUrl = $derived(images.get(`/${imageSrc}`));
</script>

<span {...standardAttributes(attributes, styles.wrapper)} style="--creature-portrait-size: {size};">
	{#if imageUrl}
		<img class={styles.image} src={imageUrl} alt="" />
	{:else}
		<span class={styles.fallback}>?</span>
	{/if}
</span>
