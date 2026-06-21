<!--
	@component Renders the outcome of an AddChargesEffect procedure —
	what charges each card gained.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import TextList from '$lib/components/localisation/TextList.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { AddChargesEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: AddChargesEffectState;
	}

	const { state, ...attributes }: Props = $props();
	const addedCharges = $derived(state.addedCharges!);
</script>

{#if addedCharges.totalCount() > 0}
	<div {...standardAttributes(attributes, styles.entry)}>
		<TextList items={Array.from(addedCharges.entries())}>
			{#snippet entry([cardStateId, count])}
				{@const card = state.game.requireEntityState(cardStateId).card}
				<EntityLink entity={card} /> +{count}
			{/snippet}
		</TextList>
	</div>
{/if}
