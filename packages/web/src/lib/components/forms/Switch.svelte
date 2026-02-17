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
	{...standardAttributes(attributes, 'switch')}
	role="radiogroup"
	aria-label={ariaLabel ? translate(ariaLabel, locale) : undefined}
	aria-labelledby={ariaLabelledBy}
	class:disabled
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
			class:selected={isSelected}
			class:has-icon={!!option.icon}
			class:has-label={!!option.label}
			onclick={() => handleSelect(option.value)}
			onkeydown={(e) => handleKeydown(e, index)}
		>
			{#if option.icon}
				<InlineSvg class="switch-icon" src={option.icon} />
			{/if}
			{#if option.label}
				<span class="switch-label">{translate(option.label, locale)}</span>
			{/if}
		</button>
	{/each}
</div>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.switch {
		display: inline-flex;
		overflow: hidden;

		button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: rz.size(xs);
			@include rz.hpadding(md);
			@include rz.vpadding(sm);
			background-color: var(--input-background-color);
			border: var(--input-border);
			font-family: inherit;
			font-size: inherit;
			color: var(--switch-color);
			cursor: pointer;
			height: var(--input-height);

			&:first-child {
				border-top-left-radius: rz.size(sm);
				border-bottom-left-radius: rz.size(sm);
			}

			&:last-child {
				border-top-right-radius: rz.size(sm);
				border-bottom-right-radius: rz.size(sm);
			}

			& + & {
				margin-left: -2px; // Collapse borders
			}

			&:hover:not(:disabled) {
				background-color: var(--switch-hover-color);
			}

			&:focus {
				outline: none;
				border-color: var(--focus-outline-color);
				position: relative;
				z-index: 2; // Ensure the border of the focused option is above its siblings
			}

			&.selected {
				background-color: var(--switch-selected-background);
				color: var(--switch-selected-color);
			}

			&:disabled {
				cursor: not-allowed;
			}
		}

		&.disabled {
			opacity: 0.5;
		}

		:global(.switch-icon) {
			flex-shrink: 0;
		}

		.switch-label {
			white-space: nowrap;
		}
	}
</style>
