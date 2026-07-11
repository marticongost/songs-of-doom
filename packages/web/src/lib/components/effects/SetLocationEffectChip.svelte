<!--
	@component Renders a SetLocationEffect chip.
-->
<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { SetLocationEffect } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: SetLocationEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'effect-chip')}>
	<Text
		ca="Moure %(target) a %(location)"
		es="Mover %(target) a %(location)"
		en="Move %(target) to %(location)"
	>
		{#snippet target()}
			<TargetChip target={effect.target} />
		{/snippet}
		{#snippet location()}
			<TargetChip target={effect.destination} />
		{/snippet}
	</Text>
</span>
