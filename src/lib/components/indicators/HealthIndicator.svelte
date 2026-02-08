<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
		contrast?: boolean;
	}

	const { amount, contrast = false, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, 'health-indicator')}
	{amount}
	{contrast}
	icon="stats/health.svg"
/>

<style lang="scss">
	:global(.health-indicator) {
		--indicator-color: var(--stat-health-color);
	}
</style>
