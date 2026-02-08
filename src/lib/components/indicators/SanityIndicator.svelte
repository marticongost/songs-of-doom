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
	{...standardAttributes(attributes, 'sanity-indicator')}
	{amount}
	{contrast}
	icon="stats/sanity.svg"
/>

<style lang="scss">
	:global(.sanity-indicator) {
		--indicator-color: var(--stat-sanity-color);
		--indicator-icon-y-offset: 0.1em;
	}
</style>
