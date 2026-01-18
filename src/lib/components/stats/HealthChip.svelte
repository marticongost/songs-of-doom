<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'health-chip')}>
	<span class="amount">{amount}</span>
	<InlineSvg class="icon" src="stats/health.svg" />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	$size: 1.4em;

	.health-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: $size;
		height: $size;
		position: relative;
		font-weight: bold;

		:global(.icon) {
			position: absolute;
			left: 0;
			top: 0;
			color: var(--stat-health-color);
			height: #{$size};
			width: #{$size};
		}
	}

	.amount {
		position: relative;
		top: -0.2em;
		z-index: 1;
		font-weight: bold;
		color: var(--text-color);
		text-shadow: 0 0 0.5em black;
	}
</style>
