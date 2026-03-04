<!--
@component
Displays a talent name with appropriate styling.
-->
<script lang="ts">
	import type { Talent } from '@songsofdoom/game';

	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';

	interface Props extends StandardAttributeProps {
		/** The talent to display. */
		talent: Talent;
	}

	const { talent, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'talent-chip')}>
	<Text {...talent.title} />
</span>

<style lang="scss">
	.talent-chip {
		font-weight: bold;
		color: var(--talent-color);
	}
</style>
