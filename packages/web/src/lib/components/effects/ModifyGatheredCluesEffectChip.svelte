<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		icon: {
			width: '1.25em',
			height: '1.25em',
			color: css.colorBindings.clueColor
		}
	});
</script>

<script lang="ts">
	import { ModifyGatheredCluesEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: ModifyGatheredCluesEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.modifyGatheredCluesEffectChip)}>
	<InlineSvg class={styles.icon} src="effects/clue.svg" />
	<ExpressionChip expression={effect.amount} relative={true} />
</span>
