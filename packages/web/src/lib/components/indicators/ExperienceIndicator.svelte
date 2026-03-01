<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, `experience-indicator${amount < 0 ? ' negative' : ''}`)}
	{amount}
	icon="experience.svg"
/>

<style lang="scss">
	:global(.experience-indicator) {
		--indicator-color: var(--experience-background-color);
		--indicator-value-color: var(--experience-foreground-color);
		--indicator-value-text-shadow: none;
	}
	:global(.experience-indicator.negative) {
		--indicator-color: var(--experience-negative-background-color);
		--indicator-value-color: var(--experience-negative-foreground-color);
	}
</style>
