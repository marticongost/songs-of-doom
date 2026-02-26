<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { focuses, type Focus, type FocusType } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		focus: Focus | FocusType;
		framed?: boolean;
	}

	const { focus, framed = true, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<InlineSvg
	{...standardAttributes(attributes, `focus-icon${framed ? ' framed' : ''}`)}
	data-focus={focusObject.type}
	src={`${focusObject.stat ? 'stats' : 'focuses'}/${focusObject.type}.svg`}
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.focus-icon) {
		align-self: center;
		border-radius: 0.2em;
		width: 1.2em;
		height: 1.2em;
		filter: drop-shadow(0 0 0.8rem black);
	}

	:global(.focus-icon.framed) {
		padding: 0.05em;
		background-color: white;
		border: 1px solid currentColor;
	}

	@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
		:global(.focus-icon[data-focus='#{$focus}']) {
			color: var(--focus-#{$focus}-color);
		}
	}
</style>
