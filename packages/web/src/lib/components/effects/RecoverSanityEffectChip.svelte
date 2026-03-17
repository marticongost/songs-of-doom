<!--
@component
Renders a sanity recovery effect, displaying the amount of sanity restored and the target.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		sanityIcon: {
			width: '1.25em',
			height: '1.25em',
			color: css.colorBindings.stats.colors.sanity
		}
	});
</script>

<script lang="ts">
	import type { RecoverSanityEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import Text from '../localisation/Text.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import TargetChip from '../targets/TargetChip.svelte';

	interface Props extends StandardAttributeProps {
		effect: RecoverSanityEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}>
	<Text ca="Recuperar" es="Recuperar" en="Recover" />
	<ExpressionChip expression={effect.amount} />
	<InlineSvg class={styles.sanityIcon} src="stats/sanity.svg" />
	<TargetChip target={effect.target} relation="to" />
</span>
