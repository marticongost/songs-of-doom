<!--
	@component
	A reusable dropdown (`<select>`) with localised option labels and an optional
	leading icon rendered via `InlineSvg`.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		dropdown: {
			position: 'relative',
			display: 'inline-block',
			select: {
				padding: css.spacing.sm,
				height: css.forms.controlHeight,
				fontFamily: 'inherit',
				fontSize: 'inherit',
				color: css.text.regularColor,
				backgroundColor: css.forms.controlBackgroundColor,
				border: css.forms.controlBorder,
				borderRadius: css.spacing.sm,
				'&:focus': {
					outline: css.focus.outline
				}
			}
		},
		dropdownWithIcon: {
			'.dropdown-icon': {
				position: 'absolute',
				left: css.spacing.md,
				top: '50%',
				transform: 'translate(-25%, -50%)',
				pointerEvents: 'none'
			},
			select: {
				paddingLeft: css.spacing.lg
			}
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getLocale } from '$lib/context/locale';
	import { cx } from '@emotion/css';
	import { translate, type LocalisedText } from '@songsofdoom/common/localisation';

	interface Option {
		value: string;
		label: LocalisedText;
	}

	interface Props extends StandardAttributeProps {
		/** Available options. */
		options: Array<Option>;
		/** The currently selected value. */
		value: string;
		/** Called when the user selects a different option. */
		onChange: (value: string) => void;
		/** Optional SVG icon source displayed before the select. */
		icon?: string;
	}

	const { options, value, onChange, icon, ...attributes }: Props = $props();

	const locale = getLocale();
</script>

<span
	{...standardAttributes(attributes, cx(styles.dropdown, { [styles.dropdownWithIcon]: !!icon }))}
>
	{#if icon}
		<InlineSvg class="dropdown-icon" src={icon} />
	{/if}
	<select {value} onchange={(e) => onChange(e.currentTarget.value)}>
		{#each options as option (option.value)}
			<option value={option.value}>{translate(option.label, locale)}</option>
		{/each}
	</select>
</span>
