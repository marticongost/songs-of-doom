<!--
@component
Renders a heal effect, displaying the amount of damage removed and the target.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		healthIcon: {
			width: '1.25em',
			height: '1.25em',
			color: css.colorBindings.stats.colors.health
		}
	});
</script>

<script lang="ts">
	import type { HealEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: HealEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<Text ca="Curar" es="Curar" en="Heal" />
	<ExpressionChip expression={effect.amount} />
	<InlineSvg class={styles.healthIcon} src="stats/health.svg" />
	<TargetChip target={effect.target} relation="to" />
</span>
