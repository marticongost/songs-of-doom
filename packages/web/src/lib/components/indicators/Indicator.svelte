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
<script lang="ts">
	import InlineSvg from '../InlineSvg.svelte';
	import { standardAttributes, type StandardAttributeProps } from '../standardattributes';

	interface Props extends StandardAttributeProps {
		/** The numeric value to display */
		amount: number;
		/** Path to the SVG icon (relative to assets/svg/) */
		icon: string;
		/** Whether to add a drop-shadow for contrast on busy backgrounds */
		contrast?: boolean;
	}

	const { amount, icon, contrast = false, ...attributes }: Props = $props();
</script>

<span {...standardAttributes(attributes, 'indicator-icon')} class:contrast>
	<span class="value">{amount}</span>
	<InlineSvg class="icon" src={icon} />
</span>

<style lang="scss">
	.indicator-icon {
		--icon-size: var(--indicator-icon-size, 1.5em);
		--color: var(--indicator-color, currentColor);
		--icon-y-offset: var(--indicator-icon-y-offset, 0);
		--value-y-offset: var(--indicator-value-y-offset, 0);
		--value-font-weight: var(--indicator-value-font-weight, bold);
		--value-color: var(--indicator-value-color, var(--text-color));
		--value-text-shadow: var(--indicator-value-text-shadow, 0 0 0.5em black);

		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: var(--icon-size);
		height: var(--icon-size);
		position: relative;

		&.contrast :global(.icon) {
			filter: drop-shadow(0 0 0.1em black);
		}

		:global(.icon) {
			position: absolute;
			left: 0;
			top: var(--icon-y-offset);
			color: var(--color);
			height: var(--icon-size);
			width: var(--icon-size);
		}
	}

	.value {
		position: relative;
		top: var(--value-y-offset);
		z-index: 1;
		font-weight: var(--value-font-weight);
		font-family: var(--number-font);
		color: var(--value-color);
		text-shadow: var(--value-text-shadow);
	}
</style>
