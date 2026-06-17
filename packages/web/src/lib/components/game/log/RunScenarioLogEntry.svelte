<!--
	@component Renders a RunScenario journal entry — which scenario is starting.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		entry: {}
	});
</script>

<script lang="ts">
	import EntityLink from '$lib/components/EntityLink.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { RunScenarioState } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		state: RunScenarioState;
	}

	const { state, ...attributes }: Props = $props();
</script>

<div {...standardAttributes(attributes, styles.entry)}>
	<Text
		ca="Iniciant escenari %(name)"
		es="Iniciando escenario %(name)"
		en="Starting scenario %(name)"
	>
		{#snippet name()}
			<EntityLink entity={state.scenarioId!} target="_blank" />
		{/snippet}
	</Text>
</div>
