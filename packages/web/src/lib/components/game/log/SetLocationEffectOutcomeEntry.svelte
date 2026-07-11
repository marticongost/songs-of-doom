<!--
	@component Renders the outcome of a SetLocationEffect procedure —
	shows where each entity moved.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { SetLocationEffectState } from '@songsofdoom/engine';
	import { isPlayerId, type CardId, type LocationId, type PlayerId } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: SetLocationEffectState;
	}

	const { state, ...attributes }: Props = $props();
	const movements = $derived(state.movements!);
</script>

{#if movements.size > 0}
	<div {...standardAttributes(attributes, styles.entry)}>
		<TextList items={Array.from(movements.entries())}>
			{#snippet entry([entityId, destinationId])}
				{@const destState = state.game.requireEntityState(destinationId as LocationId)}
				{#if isPlayerId(entityId)}
					{@const playerState = state.game.requireEntityState(entityId as PlayerId)}
					<Text
						ca="%(subject) s'ha mogut a %(destination)"
						es="%(subject) se ha movido a %(destination)"
						en="%(subject) moved to %(destination)"
						subject={playerState.character.name}
					>
						{#snippet destination()}
							<EntityLink entity={destState.card} />
						{/snippet}
					</Text>
				{:else}
					{@const cardState = state.game.requireEntityState(entityId as CardId)}
					<Text
						ca="%(subject) s'ha mogut a %(destination)"
						es="%(subject) se ha movido a %(destination)"
						en="%(subject) moved to %(destination)"
					>
						{#snippet subject()}
							<EntityLink entity={cardState.card} />
						{/snippet}
						{#snippet destination()}
							<EntityLink entity={destState.card} />
						{/snippet}
					</Text>
				{/if}
			{/snippet}
		</TextList>
	</div>
{/if}
