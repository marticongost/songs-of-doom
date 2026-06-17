<!--
	@component Generic fallback renderer for journal entries without a custom renderer.
	Shows the procedure name and current step.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});

	/**
	 * Converts a PascalCase ProcedureId to a human-readable "Title Case" string.
	 */
	function formatProcedureId(id: string): string {
		return id.replace(/([A-Z])/g, ' $1').trim();
	}
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { ProcedureState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		procedureId: string;
		state: ProcedureState;
	}

	const { procedureId, state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text
		ca="%(name) → %(step)"
		es="%(name) → %(step)"
		en="%(name) → %(step)"
		name={formatProcedureId(procedureId)}
		step={state.step ?? '—'}
	/>
</div>
