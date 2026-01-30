<script lang="ts">
	import type { Expression } from '$lib/catalog/models/expression';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import ExpressionChip from './ExpressionChip.svelte';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		expression: Expression;
		relative?: boolean;
	}

	const { expression, relative, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'proficiency-chip')}
	><!--
    --><InlineSvg
		class="proficiency-icon"
		src="effects/proficiency.svg"
	/><!--
    --><ExpressionChip {expression} {relative} />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.proficiency-chip {
		:global(.proficiency-icon) {
			color: var(--profiency-color);
		}
	}
</style>
