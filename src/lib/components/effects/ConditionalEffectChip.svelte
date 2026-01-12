<script lang="ts">
	import { ConditionalEffect, Effect, type Case } from '$lib/catalog/models/effects';
	import ConditionChip from '../conditions/ConditionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import Tree, { TreeContext } from '../Tree.svelte';
	import EffectChip from './EffectChip.svelte';
	export let effect: ConditionalEffect;
</script>

{#snippet treeItem(context: TreeContext<Effect | Case>)}
	{#if context.item instanceof Effect}
		<EffectChip effect={context.item} />
	{:else}
		<Text ca="Si" es="Si" en="If" />
		<ConditionChip condition={context.item.condition} />
	{/if}
{/snippet}

<Tree
	appearence="arrows"
	root={effect as Effect | Case}
	getChildren={(context) => {
		if (context.item instanceof ConditionalEffect) {
			return context.item.cases;
		} else if (context.item instanceof Effect) {
			return [];
		} else {
			return context.item.effects;
		}
	}}
	itemSnippet={treeItem}
/>
