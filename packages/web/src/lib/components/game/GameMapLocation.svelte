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
			background: css.palette.somber,
			transition: 'box-shadow 0.2s'
		},
		inner: {
			display: 'flex',
			flexDirection: 'column',
			flex: 1,
			minHeight: 0,
			overflow: 'hidden',
			borderRadius: 'inherit'
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
		},
		actors: {
			...css.row('xs'),
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
			flexWrap: 'wrap',
			justifyContent: 'center',
			padding: css.spacing.xs,
			gap: css.spacing.xs
		}
	});
</script>

<script lang="ts">
	import { images } from '$lib/assets/img';
	import ActorPiece from '$lib/components/game/ActorPiece.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';
	import type { CardState, LocationState, PlayerState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		location: LocationState;
		entities: ReadonlyArray<PlayerState | CardState>;
		onEnemyClick?: (creatureIndex: number) => void;
	}

	const { location, entities, onEnemyClick, ...attributes }: Props = $props();

	const locale = getLocale();

	const name = $derived(translate(location.card.title, locale));
	const imageSrc = $derived(`cards/${location.card.id}.jpg`);
	const imageUrl = $derived(images.get(`/${imageSrc}`));

	/** Creature entities at this location, ordered for click indexing. */
	const creatureEntities = $derived(
		entities.filter(
			(e): e is CardState => 'card' in e && (e as CardState).card.type.id === 'creature'
		)
	);
</script>

<div {...standardAttributes(attributes, styles.root)}>
	<div class={styles.inner}>
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
	{#if entities.length > 0}
		<div class={styles.actors}>
			{#each entities as entity (entity.id)}
				{@const isCreature = 'card' in entity && (entity as CardState).card.type.id === 'creature'}
				<ActorPiece
					{entity}
					onClick={isCreature && onEnemyClick
						? () => onEnemyClick(creatureEntities.indexOf(entity as CardState))
						: undefined}
				/>
			{/each}
		</div>
	{/if}
</div>
