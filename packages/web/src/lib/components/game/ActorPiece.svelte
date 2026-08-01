<!--
	@component
	Renders a circular portrait for a map entity (player or creature) on the game map.

	Discriminates between players and creatures to render the appropriate portrait type,
	and centralises interactive behaviour (e.g. clicking an enemy to open the card carousel).

	@prop entity - The entity state (PlayerState or CardState for a creature).
	@prop onClick - When provided, wraps the portrait in a clickable container.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		piece: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
			borderRadius: '100%',
			border: '2px solid rgba(255,255,255,0.5)',
			boxShadow: '0 0 1rem black',
			'[data-type=creature]': {
				borderColor: css.colorBindings.cardBackgrounds.colors.creature.main.color2
			}
		},
		clickable: {
			cursor: 'pointer',
			'&:hover': {
				filter: 'brightness(1.3)'
			}
		}
	});

	const size = '3em';
</script>

<script lang="ts">
	import CharacterPortrait from '$lib/components/characters/CharacterPortrait.svelte';
	import CreaturePortrait from '$lib/components/game/CreaturePortrait.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { cx } from '@emotion/css';
	import type { CardState, PlayerState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		/** The entity state — a player or a creature card. */
		entity: PlayerState | CardState;
		/** When provided, renders the portrait as clickable and invokes this callback. */
		onClick?: () => void;
	}

	const { entity, onClick, ...attributes }: Props = $props();

	/** Whether this entity is a player (has a character). */
	const isPlayer = $derived('character' in entity);

	/** The portrait number for player entities. */
	const playerPortrait = $derived(isPlayer ? (entity as PlayerState).character.portrait : 0);

	/** The card ID for creature entities (used to load the card image). */
	const creatureCardId = $derived(isPlayer ? '' : (entity as CardState).card.id);

	/** Combined base class for creature button, conditionally adding clickable style. */
	const buttonClass = $derived(cx(styles.piece, onClick && styles.creature));
</script>

{#if isPlayer}
	<span {...standardAttributes(attributes, styles.piece)} data-type="player">
		<CharacterPortrait portrait={playerPortrait} circular {size} />
	</span>
{:else}
	<button
		{...standardAttributes(attributes, buttonClass)}
		onclick={onClick}
		type="button"
		aria-label="View creature card"
		data-type="creature"
	>
		<CreaturePortrait cardId={creatureCardId} {size} />
	</button>
{/if}
