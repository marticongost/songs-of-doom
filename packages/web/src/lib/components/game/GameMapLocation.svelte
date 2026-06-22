<!--
	@component Renders a single location on the game map.

	Displays a title bar with the location's translated name and the location's
	card image below it. Positioned absolutely by the parent {@link GameMap}.
-->
<script lang="ts" module>
	import cardHeadingBackground from '$lib/assets/img/card-heading.png?url';
	import * as css from '$lib/styles';

	const styles = css.styles({
		root: {
			width: 'var(--node-size)',
			height: 'var(--node-size)',
			position: 'absolute',
			display: 'flex',
			flexDirection: 'column',
			border: css.separators.regularBorder,
			borderRadius: '0.25em',
			overflow: 'hidden',
			background: css.palette.somber,
			transition: 'box-shadow 0.2s'
		},
		header: {
			...css.row('xs'),
			...css.hpadding('xs'),
			...css.vpadding('xs'),
			position: 'relative',
			background: `url('${cardHeadingBackground}') center / cover`,
			padding: css.spacing.sm,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			justifyContent: 'center',
			flexShrink: 0,
			'&::before': {
				content: '""',
				position: 'absolute',
				inset: '0',
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
				backgroundImage: css.colorBindings.cardBackgrounds.get('location').main.background,
				opacity: 0.7
			}
		},
		heading: {
			position: 'relative',
			color: css.text.headingColor,
			fontFamily: css.fonts.heading,
			fontSize: '0.7em'
		},
		image: {
			flex: 1,
			minHeight: 0,
			width: '100%',
			objectFit: 'cover',
			display: 'block'
		},
		imageFallback: {
			flex: 1,
			minHeight: 0,
			width: '100%',
			background: css.palette.ash,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: css.palette.darkOpium,
			fontSize: '0.6em',
			fontFamily: css.fonts.text
		}
	});
</script>

<script lang="ts">
	import { images } from '$lib/assets/img';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';
	import type { LocationState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		location: LocationState;
	}

	const { location, ...attributes }: Props = $props();

	const locale = getLocale();

	const name = $derived(translate(location.card.title, locale));
	const imageSrc = $derived(`cards/${location.card.id}.jpg`);
	const imageUrl = $derived(images.get(`/${imageSrc}`));
</script>

<div {...standardAttributes(attributes, styles.root)}>
	<div class={styles.header}>
		<div class={styles.heading}>
			{name}
		</div>
	</div>
	{#if imageUrl}
		<img class={styles.image} src={imageUrl} alt={name} />
	{:else}
		<div class={styles.imageFallback}>No image</div>
	{/if}
</div>
