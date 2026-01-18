<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'damage-chip')}>
	<span class="amount">{amount}</span>
	<InlineSvg class="icon" src="effects/damage.svg" />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	$size: 1.5em;

	.damage-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: $size;
		height: $size;
		position: relative;

		:global(.icon) {
			position: absolute;
			left: 0;
			top: 0.1em;
			color: var(--stat-health-color);
			height: #{$size};
			width: #{$size};
		}
	}

	.amount {
		position: relative;
		z-index: 1;
	}
</style>
