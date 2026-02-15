<script lang="ts">
	import { ModifyDamageEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: ModifyDamageEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'modify-damage-effect-chip')}>
	<InlineSvg class="damage-icon" src="effects/damage.svg" />
	<ExpressionChip expression={effect.amount} relative={true} />
</span>

<style lang="scss">
	.modify-damage-effect-chip {
		& > :global(.damage-icon) {
			width: 1.25em;
			height: 1.25em;
			color: var(--stat-health-color);
		}
	}
</style>
