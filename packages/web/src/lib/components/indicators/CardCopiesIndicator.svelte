<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator {...standardAttributes(attributes, 'card-copies-indicator')} {amount} icon="cards.svg" />

<style lang="scss">
	:global(.card-copies-indicator) {
		--indicator-value-text-shadow: 0 0 0.2em black;
		--indicator-color: var(--card-copies-indicator-color);
	}
</style>
