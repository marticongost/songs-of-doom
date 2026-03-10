<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		icon: {
			color: css.colorBindings.proficiencyColor
		}
	});
</script>

<script lang="ts">
	import ExpressionChip from '$lib/components/expressions/ExpressionChip.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import type { ScalarExpressionType } from '@songsofdoom/game';
	import InlineSvg from './InlineSvg.svelte';

	interface Props extends StandardAttributeProps {
		expression: ScalarExpressionType;
		relative?: boolean;
	}

	const { expression, relative, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes)}
	><!--
    --><InlineSvg
		class={styles.icon}
		src="effects/proficiency.svg"
	/><!--
    --><ExpressionChip {expression} {relative} />
</span>
