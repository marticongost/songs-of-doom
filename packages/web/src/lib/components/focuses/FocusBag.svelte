<!--
@component
Displays the composition of a character's focus bag, showing stacks of focus
tokens grouped by focus type and pip value.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		focusBag: {
			...css.column('sm'),
			alignItems: 'flex-start'
		},
		focusRow: {
			...css.row('sm'),
			alignItems: 'flex-end'
		}
	});
</script>

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

<div {...standardAttributes(attributes, styles.focusBag)}>
	{#each rows as { focus, stacks } (focus.type)}
		<div class={styles.focusRow}>
			{#each stacks as { value, copies } (value)}
				<FocusStack {focus} {value} size={copies} />
			{/each}
		</div>
	{/each}
</div>
