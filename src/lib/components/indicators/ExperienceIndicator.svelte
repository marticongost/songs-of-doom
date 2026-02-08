<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, 'experience-indicator')}
	{amount}
	icon="experience.svg"
/>

<style lang="scss">
	:global(.experience-indicator) {
		--indicator-icon-size: 1.2em;
		--indicator-color: var(--experience-background-color);
		--indicator-value-y-offset: -0.1em;
		--indicator-value-color: var(--experience-foreground-color);
		--indicator-value-text-shadow: none;
	}
</style>
