<!--
@component
Renders a TestEffect that causes a target to perform a test with a certain proficiency level.
Displays the test expression followed by the results table.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		results: {
			marginLeft: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import { TestEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props {
		effect: TestEffect;
	}

	const { effect }: Props = $props();
</script>

<Text ca="Prova" es="Prueba" en="Test" />
<Parameters>
	<ExpressionChip expression={effect.expression} />
</Parameters>
<ResultsTableEffectChip class={styles.results} effect={effect.results} />
