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
	import { BaseCounter } from '@songsofdoom/common';
	import {
		getFocusTokenType,
		getFocusTokenValue,
		type FocusToken,
		type FocusType
	} from '@songsofdoom/game';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import FocusStack from './FocusStack.svelte';

	interface Props extends StandardAttributeProps {
		/**
		 * The focus bag composition, as returned by CharacterState.getFocusTokens().
		 */
		focuses: BaseCounter<FocusToken>;
	}

	const { focuses, ...attributes }: Props = $props();

	const rows = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local scratch variable, not reactive state
		const byType = new Map<string, { value: number; copies: number }[]>();
		for (const [token, copies] of focuses.entries()) {
			const type = getFocusTokenType(token);
			const value = getFocusTokenValue(token);
			if (!byType.has(type)) byType.set(type, []);
			byType.get(type)!.push({ value, copies });
		}
		return [...byType.entries()].map(([type, stacks]) => ({
			type: type as FocusType,
			stacks: stacks.sort((a, b) => a.value - b.value)
		}));
	});
</script>

<div {...standardAttributes(attributes, styles.focusBag)}>
	{#each rows as { type, stacks } (type)}
		<div class={styles.focusRow}>
			{#each stacks as { value, copies } (value)}
				<FocusStack focus={type} {value} size={copies} />
			{/each}
		</div>
	{/each}
</div>
