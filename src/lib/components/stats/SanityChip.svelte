<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		amount: number;
		contrast?: boolean;
	}

	const { amount, contrast = false, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'sanity-chip')} class:contrast>
	<span class="amount">{amount}</span>
	<InlineSvg class="icon" src="stats/sanity.svg" />
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;
	$size: 1.4em;

	.sanity-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: $size;
		height: $size;
		position: relative;

		&.contrast :global(.icon) {
			filter: drop-shadow(0 0 0.1em black);
		}

		:global(.icon) {
			position: absolute;
			left: 0;
			top: 0.1em;
			color: var(--stat-sanity-color);
			height: #{$size};
			width: #{$size};
		}
	}

	.amount {
		position: relative;
		z-index: 1;
		font-weight: bold;
		color: var(--text-color);
		text-shadow: 0 0 0.5em black;
	}
</style>
