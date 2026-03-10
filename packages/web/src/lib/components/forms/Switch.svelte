<!--
@component
A segmented control for selecting one option from multiple choices.
Each segment can display an icon, text, or both.

@example
```svelte
<Switch
    options={[
        { value: 'grid', icon: 'grid.svg', 'aria-label': { en: 'Grid view' } },
        { value: 'list', icon: 'list.svg', 'aria-label': { en: 'List view' } }
    ]}
    bind:value={viewMode}
    aria-label={{ ca: 'Mode de visualització', en: 'View mode' }}
/>
```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		switch: {
			display: 'inline-flex',
			overflow: 'hidden'
		},
		button: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: css.spacing.xs,
			...css.hpadding('md'),
			...css.vpadding('sm'),
			backgroundColor: css.forms.controlBackgroundColor,
			border: css.forms.controlBorder,
			fontFamily: 'inherit',
			fontSize: 'inherit',
			color: css.palette.scorpion,
			cursor: 'pointer',
			height: css.forms.controlHeight,
			'&:first-child': {
				borderTopLeftRadius: css.spacing.sm,
				borderBottomLeftRadius: css.spacing.sm
			},
			'&:last-child': {
				borderTopRightRadius: css.spacing.sm,
				borderBottomRightRadius: css.spacing.sm
			},
			'& + &': {
				marginLeft: '-2px'
			},
			'&:hover:not(:disabled):not([aria-checked="true"])': {
				backgroundColor: css.palette.ash
			},
			'&:focus': {
				outline: 'none',
				borderColor: css.focus.outlineColor,
				position: 'relative',
				zIndex: 2
			},
			'&:disabled': {
				cursor: 'not-allowed'
			},
			'&[aria-checked="true"]': {
				backgroundColor: css.palette.lightCocoaBrown,
				color: css.palette.opium
			}
		},
		disabledSwitch: {
			opacity: '0.5'
		},
		icon: {
			flexShrink: '0'
		},
		label: {
			whiteSpace: 'nowrap'
		}
	});

	import type { LocalisedText } from '@songsofdoom/common/localisation';

	/**
	 * Represents a single option in the Switch component.
	 * At least one of `label` or `icon` must be provided.
	 * If only `icon` is provided, `aria-label` is required for accessibility.
	 */
	export interface SwitchOption<T extends string = string> {
		/** Unique value for this option. */
		value: T;
		/** Optional localized label text. */
		label?: LocalisedText;
		/** Optional icon source path (passed to InlineSvg). */
		icon?: string;
		/** Accessible label for screen readers (required if no visible label). */
		'aria-label'?: LocalisedText;
	}
</script>

<script lang="ts" generics="T extends string">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { cx } from '@emotion/css';
	import { translate } from '@songsofdoom/common/localisation';

	interface Props extends StandardAttributeProps {
		/** Available options. */
		options: Array<SwitchOption<T>>;
		/** The currently selected value. */
		value: T;
		/** Called when selection changes. */
		onchange?: (value: T) => void;
		/** Whether the entire component is disabled. */
		disabled?: boolean;
		/** Accessible label for the group. */
		'aria-label'?: LocalisedText;
		/** ID of element that labels this group (alternative to aria-label). */
		'aria-labelledby'?: string;
		/** Optional name for form submission. */
		name?: string;
	}

	let {
		options,
		value = $bindable(),
		onchange,
		disabled = false,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		name,
		...attributes
	}: Props = $props();

	const locale = getLocale();

	let containerRef: HTMLDivElement | undefined = $state();

	function handleSelect(optionValue: T): void {
		if (disabled) return;
		value = optionValue;
		onchange?.(value);
	}

	function handleKeydown(event: KeyboardEvent, index: number): void {
		if (disabled) return;

		let newIndex = index;
		switch (event.key) {
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				newIndex = index > 0 ? index - 1 : options.length - 1;
				break;
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				newIndex = index < options.length - 1 ? index + 1 : 0;
				break;
			case 'Home':
				event.preventDefault();
				newIndex = 0;
				break;
			case 'End':
				event.preventDefault();
				newIndex = options.length - 1;
				break;
			default:
				return;
		}

		const newOption = options[newIndex];
		handleSelect(newOption.value);

		// Focus the new element
		const buttons = containerRef?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
		buttons?.[newIndex]?.focus();
	}

	function getOptionAriaLabel(option: SwitchOption<T>): string | undefined {
		if (option['aria-label']) {
			return translate(option['aria-label'], locale);
		}
		if (option.label) {
			return translate(option.label, locale);
		}
		return undefined;
	}
</script>

<div
	bind:this={containerRef}
	{...standardAttributes(attributes, cx(styles.switch, { [styles.disabledSwitch]: disabled }))}
	role="radiogroup"
	aria-label={ariaLabel ? translate(ariaLabel, locale) : undefined}
	aria-labelledby={ariaLabelledBy}
>
	{#each options as option, index (option.value)}
		{@const isSelected = option.value === value}
		<button
			type="button"
			role="radio"
			aria-checked={isSelected}
			aria-label={getOptionAriaLabel(option)}
			tabindex={isSelected ? 0 : -1}
			disabled={disabled || undefined}
			{name}
			class={styles.button}
			onclick={() => handleSelect(option.value)}
			onkeydown={(e) => handleKeydown(e, index)}
		>
			{#if option.icon}
				<InlineSvg class={styles.icon} src={option.icon} />
			{/if}
			{#if option.label}
				<span class={styles.label}>{translate(option.label, locale)}</span>
			{/if}
		</button>
	{/each}
</div>
