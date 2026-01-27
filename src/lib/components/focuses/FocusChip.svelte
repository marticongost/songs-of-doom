<script lang="ts">
	import { focuses, type Focus, type FocusType } from '$lib/catalog/models/focus';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import FocusIcon from './FocusIcon.svelte';

	interface Props extends StandardAttributeProps {
		focus: Focus | FocusType;
	}

	const { focus, ...attributes }: Props = $props();

	const focusObject = $derived(typeof focus === 'string' ? focuses[focus] : focus);
</script>

<span {...standardAttributes(attributes, 'focus-chip')} data-focus={focusObject.type}>
	<FocusIcon focus={focusObject} />
	<span class="focus-name"><Text {...focusObject.title} /></span>
</span>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.focus-chip {
		@include rz.row(xs);
		display: inline-flex;
		align-items: baseline;

		@each $focus in strength, agility, intelligence, charisma, will, health, sanity, heroism, any {
			&[data-focus='#{$focus}'] {
				color: var(--focus-#{$focus}-color);
			}
		}
	}

	.focus-name {
		font-weight: bold;
	}
</style>
