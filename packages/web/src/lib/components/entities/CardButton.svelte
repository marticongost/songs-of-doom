<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		cardButton: {
			...css.row('sm'),
			...css.vpadding('sm'),
			...css.hpadding('md'),
			width: '100%',
			height: '2.8em',
			border: css.separators.regularBorder,
			borderRadius: css.spacing.sm,
			cursor: 'pointer',
			fontFamily: 'inherit',
			fontSize: 'inherit',
			textAlign: 'left',
			...css.colorBindings.cardBackgrounds.rules('data-type', (color) => ({
				background: color.main.background
			})),
			'&:hover': {
				borderColor: css.text.highlightColor
			},
			'&:focus': {
				borderColor: css.focus.outlineColor,
				outline: 'none'
			}
		},
		dimmed: {
			opacity: '0.6',
			filter: 'grayscale(30%) brightness(80%)'
		},
		title: {
			fontFamily: css.fonts.heading,
			fontWeight: 'bold',
			color: css.text.headingColor,
			textShadow: '0 0 0.5em rgba(0, 0, 0, 0.8)',
			marginRight: 'auto'
		}
	});
</script>

<script lang="ts">
	import type { EntityManager } from '$lib/components/entities/entitymanager';
	import { entityUrl } from '$lib/urls';
	import { type Entity } from '@songsofdoom/game';
	import CardCopiesIndicator from '../indicators/CardCopiesIndicator.svelte';
	import ExperienceIndicator from '../indicators/ExperienceIndicator.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import CardLevel from './CardLevel.svelte';

	interface Props extends StandardAttributeProps {
		entity: Entity;
		onclick?: (e: MouseEvent) => void;

		/** Optional entity manager for state and interactions */
		entityManager?: EntityManager;

		/** Whether to visually dim the button */
		dimmed?: boolean;
	}

	const {
		entity,
		onclick,
		entityManager: entityManager,
		dimmed = false,
		...attributes
	}: Props = $props();
	const attr = $derived(onclick ? { onclick } : { href: entityUrl.get(entity) });
</script>

<svelte:element
	this={onclick ? 'button' : 'a'}
	{...standardAttributes(attributes, styles.cardButton)}
	class:dimmed
	data-type={entity.type.id}
	data-entity={entity.id}
	{...attr}
>
	<div class={styles.title}><Text {...entity.title} /></div>
	<CardLevel {entity} />
	{#if entity.xpCost !== undefined}
		<ExperienceIndicator amount={entity.xpCost} />
	{/if}
	{#if entityManager}
		<CardCopiesIndicator amount={entityManager.getNumberOfOwnedCopies(entity)} />
	{/if}
</svelte:element>
