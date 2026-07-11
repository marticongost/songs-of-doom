<!--
	@component Renders a SetLocationEffect journal entry.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import SetLocationEffectChip from '$lib/components/effects/SetLocationEffectChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { SetLocationEffectState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: SetLocationEffectState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<SetLocationEffectChip effect={state.effect} />
</div>
