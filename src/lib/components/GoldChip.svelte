<script lang="ts">
	import InlineSvg from './InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from './standardattributes';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'gold-chip')}>
	<span class="amount">{amount}</span>
	<InlineSvg class="icon" src="gold.svg" />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	$size: 1.2em;

	.gold-chip {
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
			color: var(--gold-background-color);
			height: #{$size};
			width: #{$size};
		}
	}

	.amount {
		position: relative;
		top: -0.1em;
		z-index: 1;
		font-weight: bold;
		color: var(--gold-foreground-color);
		text-shadow: 0 0 0.2em black;
	}
</style>
