<script lang="ts" module>
	import * as css from '$lib/styles';

	export const styles = css.styles({
		nonCompactEffectList: {
			...css.column('xs')
		}
	});
</script>

<script lang="ts">
	import type { Effect } from '@songsofdoom/game';
	import TextList from '../localisation/TextList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import EffectChip from './EffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effects: Effect[];
		compact?: boolean;
	}
	const { effects, compact = true, ...attributes }: Props = $props();
</script>

{#if compact}
	<TextList {...standardAttributes(attributes)} items={effects} type="commas">
		{#snippet entry(effect)}
			<EffectChip {effect} {compact} />
		{/snippet}
	</TextList>
{:else}
	<div {...standardAttributes(attributes, styles.nonCompactEffectList)}>
		{#each effects as effect (effect)}
			<div>
				<EffectChip {effect} {compact} />
			</div>
		{/each}
	</div>
{/if}
