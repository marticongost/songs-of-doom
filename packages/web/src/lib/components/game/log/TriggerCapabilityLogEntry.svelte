<!--
	@component Renders a TriggerCapability journal entry — who used what capability.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getGameStore } from '$lib/context/gamestore';
	import type { TriggerCapabilityState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: TriggerCapabilityState;
	}

	const { state, ...attributes }: Props = $props();
	const store = getGameStore();
	const card = $derived(store.gameState?.getEntityState(state.cardId)?.card);
</script>

{#if card}
	<div {...standardAttributes(attributes, styles.entry)}>
		<EntityLink entity={card} />
	</div>
{/if}
