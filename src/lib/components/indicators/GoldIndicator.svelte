<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator {...standardAttributes(attributes, 'gold-indicator')} {amount} icon="gold.svg" />

<style lang="scss">
	:global(.gold-indicator) {
		--indicator-icon-size: 1.2em;
		--indicator-color: var(--gold-background-color);
		--indicator-value-y-offset: -0.1em;
		--indicator-value-color: var(--gold-foreground-color);
		--indicator-value-text-shadow: 0 0 0.2em black;
	}
</style>
