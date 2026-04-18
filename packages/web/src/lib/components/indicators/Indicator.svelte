<!--
@component
Displays a numeric value overlaid on an SVG icon. Base component for indicators like HealthIndicator, DamageIndicator, ExperienceIndicator, etc.

Customize appearance via CSS custom properties:
- `--indicator-icon-size`: Overall size (default: 1.4em)
- `--indicator-color`: Icon color (default: currentColor)
- `--indicator-icon-y-offset`: Icon vertical offset (default: 0)
- `--indicator-value-y-offset`: Value text vertical offset (default: 0)
- `--indicator-value-font-weight`: Value font weight (default: bold)
- `--indicator-value-color`: Value text color (default: --text-color)
- `--indicator-value-text-shadow`: Value text shadow (default: 0 0 0.5em black)

@example
```svelte
<IndicatorIcon amount={5} icon="stats/health.svg" style="--indicator-color: red" />
```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';
	import { cx } from '@emotion/css';

	const styles = css.styles({
		indicatorIcon: {
			'--icon-size': 'var(--indicator-icon-size, 1.5em)',
			'--color': 'var(--indicator-color, currentColor)',
			'--icon-y-offset': 'var(--indicator-icon-y-offset, 0)',
			'--value-y-offset': 'var(--indicator-value-y-offset, 0)',
			'--value-font-weight': 'var(--indicator-value-font-weight, bold)',
			'--value-color': 'var(--indicator-value-color, var(--text-color))',
			'--value-text-shadow': 'var(--indicator-value-text-shadow, 0 0 0.5em black)',
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: 'var(--icon-size)',
			height: 'var(--icon-size)',
			position: 'relative'
		},
		icon: {
			position: 'absolute',
			left: '0',
			top: 'var(--icon-y-offset)',
			color: 'var(--color)',
			height: 'var(--icon-size)',
			width: 'var(--icon-size)'
		},
		contrastingIcon: {
			filter: 'drop-shadow(0 0 0.1em black)'
		},
		value: {
			position: 'relative',
			top: 'var(--value-y-offset)',
			zIndex: '1',
			fontWeight: 'var(--value-font-weight)',
			fontFamily: css.fonts.number,
			color: 'var(--value-color)',
			textShadow: 'var(--value-text-shadow)'
		}
	});
</script>

<script lang="ts">
	import type { ScalarExpressionType } from '@songsofdoom/game';
	import ExpressionChip from '../expressions/ExpressionChip.svelte';
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';
	import Operator from '../structured-text/Operator.svelte';

	interface Props extends StandardAttributeProps {
		/** The numeric value to display */
		amount: ScalarExpressionType;
		/** Path to the SVG icon (relative to assets/svg/) */
		icon: string;
		/** Whether to add a drop-shadow for contrast on busy backgrounds */
		contrast?: boolean;
	}

	const { amount, icon, contrast = false, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, styles.indicatorIcon)}>
	{#if typeof amount === 'number'}
		<span class={styles.value}>{amount}</span>
	{/if}
	<InlineSvg class={cx(styles.icon, { [styles.contrastingIcon]: contrast })} src={icon} />
	{#if typeof amount !== 'number'}
		<Operator>=</Operator>
		<ExpressionChip expression={amount} />
	{/if}
</span>
