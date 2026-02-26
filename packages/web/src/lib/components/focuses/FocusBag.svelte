<!--
@component
Displays the composition of a character's focus bag, showing stacks of focus
tokens grouped by focus type and pip value.
-->
<script lang="ts">
	import type { Focus } from '@songsofdoom/game';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import FocusStack from './FocusStack.svelte';

	interface Props extends StandardAttributeProps {
		/**
		 * The focus bag composition, as returned by CharacterState.getFocusTokens().
		 * Maps each focus to a record of { [pipValue]: copies }.
		 */
		focuses: Map<Focus, Record<number, number>>;
	}

	const { focuses, ...attributes }: Props = $props();

	const rows = $derived(
		[...focuses.entries()].map(([focus, tokensByValue]) => ({
			focus,
			stacks: Object.entries(tokensByValue)
				.sort(([a], [b]) => +a - +b)
				.map(([value, copies]) => ({ value: +value, copies }))
		}))
	);
</script>

<div {...standardAttributes(attributes, 'focus-bag')}>
	{#each rows as { focus, stacks } (focus.type)}
		<div class="focus-row">
			{#each stacks as { value, copies } (value)}
				<FocusStack {focus} {value} size={copies} />
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.focus-bag {
		@include rz.column(sm);
		align-items: flex-start;
	}

	.focus-row {
		@include rz.row(sm);
		align-items: flex-end;
	}
</style>
