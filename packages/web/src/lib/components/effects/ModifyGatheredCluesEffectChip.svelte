<script lang="ts">
	import { ModifyGatheredCluesEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: ModifyGatheredCluesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'modify-gathered-clues-effect-chip')}>
	<InlineSvg class="clue-icon" src="effects/clue.svg" />
	<ExpressionChip expression={effect.amount} relative={true} />
</span>

<style lang="scss">
	.modify-gathered-clues-effect-chip {
		& > :global(.clue-icon) {
			width: 1.25em;
			height: 1.25em;
			color: var(--clue-color);
		}
	}
</style>
