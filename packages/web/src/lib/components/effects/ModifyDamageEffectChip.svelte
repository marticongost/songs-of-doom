<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		icon: {
			width: '1.25em',
			height: '1.25em',
			color: css.colorBindings.stats.colors.health
		}
	});
</script>

<script lang="ts">
	import { ModifyDamageEffect } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		effect: ModifyDamageEffect;
	}

	const { effect, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.modifyDamageEffectChip)}>
	<InlineSvg class={styles.icon} src="effects/damage.svg" />
	<ExpressionChip expression={effect.amount} relative={true} />
</span>
