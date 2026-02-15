<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, 'damage-indicator')}
	{amount}
	icon="effects/damage.svg"
/>

<style lang="scss">
	:global(.damage-indicator) {
		--indicator-icon-size: 1.5em;
		--indicator-color: var(--stat-health-color);
		--indicator-value-y-offset: 0.1em;
		--indicator-value-font-weight: normal;
		--indicator-value-text-shadow: none;
	}
</style>
