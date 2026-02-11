<!--
@component
Renders a TestEffect that causes a target to perform a test with a certain proficiency level.
Displays the test expression followed by the results table.
-->
<script lang="ts">
	import { TestEffect } from '$lib/catalog/models/effects';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props {
		effect: TestEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Prova de" es="Prueba de" en="Test of" />
<ExpressionChip expression={effect.expression} />
<Parameters>
	<ResultsTableEffectChip effect={effect.results} />
</Parameters>
