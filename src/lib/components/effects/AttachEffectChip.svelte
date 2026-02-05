<!--
@component
Renders an attach effect, displaying the target to which the card attaches.
-->
<script lang="ts">
	import type { AttachEffect } from '$lib/catalog/models/effects';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: AttachEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'attach-effect-chip')}>
	<Text ca="Vincular" es="Vincular" en="Attach" />
	<TargetChip target={effect.target} relation="to" />
</span>
