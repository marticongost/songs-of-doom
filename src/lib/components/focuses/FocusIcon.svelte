<script lang="ts">
	import { focuses, type Focus, type FocusType } from '$lib/catalog/models/focus';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		focus: Focus | FocusType;
	}

	const { focus, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<InlineSvg
	{...standardAttributes(attributes, 'focus-icon')}
	data-focus={focusObject.type}
	src={`${focusObject.stat ? 'stats' : 'focuses'}/${focusObject.type}.svg`}
/>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	:global(.focus-icon) {
		align-self: center;
		border-radius: 0.2em;
		padding: 0.05em;
		width: 1.2em;
		height: 1.2em;
		filter: drop-shadow(0 0 0.8rem black);
	}

	@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
		:global(.focus-icon[data-focus='#{$focus}']) {
			background-color: white;
			color: var(--focus-#{$focus}-color);
			border: 1px solid var(--focus-#{$focus}-color);
		}
	}
</style>
