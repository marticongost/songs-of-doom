<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		results: {
			marginLeft: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import { InvestigateEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: InvestigateEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.investigateEffectChip)}>
	<Text ca="Investigar" es="Investigar" en="Investigate" />
	<Parameters
		><!--
		--><ExpressionChip expression={effect.expression} /><!--
			--><PropertyList
			properties={effect.properties}
		/><!--
				--></Parameters
	>
	<ResultsTableEffectChip class={styles.results} effect={effect.results} />
</span>
