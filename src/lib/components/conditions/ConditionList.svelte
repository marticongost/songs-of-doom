<script lang="ts">
	import type { Condition } from '$lib/catalog/models/conditions';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import InlineSvg from '../InlineSvg.svelte';
	import ConditionChip from './ConditionChip.svelte';

	interface Props extends StandardAttributeProps {
		conditions: Condition[];
	}

	const { conditions, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'condition-list')}>
	{#each conditions as condition, index}
		<InlineSvg class="condition-connector" src="effects/{index > 0 ? 'and' : 'condition'}.svg" />
		<ConditionChip {condition} />
	{/each}
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	.condition-list {
		:global(.condition-connector) {
			color: var(--text-subtle-color);
		}
	}
</style>
