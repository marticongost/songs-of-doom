<!--
	@component Renders the outcome of an AddChargesEffect procedure —
	what charges each card gained.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({});
</script>

<script lang="ts">
	import AddChargeEffectChip from '$lib/components/effects/AddChargeEffectChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { AddChargesEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: AddChargesEffectState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<AddChargeEffectChip effect={state.effect} />
</div>
