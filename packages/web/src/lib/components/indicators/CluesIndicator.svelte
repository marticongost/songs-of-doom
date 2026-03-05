<script lang="ts">
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Indicator from './Indicator.svelte';

	interface Props extends StandardAttributeProps {
		amount: number;
	}

	const { amount, ...attributes }: Props = $props();
</script>

<Indicator
	{...standardAttributes(attributes, 'clues-indicator')}
	{amount}
	icon="effects/clue.svg"
/>

<style lang="scss">
	:global(.clues-indicator) {
		--indicator-icon-size: 1.5em;
		--indicator-color: var(--clue-color);
	}
</style>
