<script lang="ts">
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import Variable from '$lib/components/structured-text/Variable.svelte';
	import TargetChip from '$lib/components/targets/TargetChip.svelte';
	import { SaveTargetToVariableEffect } from '@songsofdoom/game';

	interface Props extends StandardAttributeProps {
		effect: SaveTargetToVariableEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<Variable>{effect.name}</Variable> = <TargetChip target={effect.value} />
</span>
