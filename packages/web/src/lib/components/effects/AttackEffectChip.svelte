<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		results: {
			marginLeft: css.spacing.sm
		}
	});
</script>

<script lang="ts">
	import { AttackEffect } from '@songsofdoom/game';
	import Parameters from '../capabilities/Parameters.svelte';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import Text from '../localisation/Text.svelte';
	import PropertyList from '../properties/PropertyList.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import ResultsTableEffectChip from './ResultsTableEffectChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: AttackEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<Text ca="Atacar" es="Atacar" en="Attack" />
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
