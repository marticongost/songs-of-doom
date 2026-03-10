<!--
@component
Renders a single rule entry with a heading anchor and localised SVX body.

@example
```svelte
<RuleEntry entry={ruleEntry} />
```
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		ruleEntry: {
			scrollMarginTop: css.spacing.xl,
			backgroundColor: 'var(--panel-background-color)',
			lineHeight: '1.5em',
			padding: css.spacing.md,
			p: {
				...css.vmargin('md')
			},
			ul: {
				listStyleType: 'disc'
			},
			li: {
				marginLeft: css.spacing.md,
				marginTop: css.spacing.sm
			}
		},
		ruleTitle: {
			fontFamily: css.fonts.heading,
			fontSize: '1.5em',
			color: css.text.headingColor,
			marginBottom: css.spacing.sm,
			a: {
				color: 'inherit',
				textDecoration: 'none',
				'&:hover': {
					color: css.text.highlightColor
				},
				'&:hover:after': {
					content: "'#'",
					marginLeft: css.spacing.xs,
					fontWeight: 'normal',
					color: css.text.mutedColor
				}
			}
		},
		ruleMissing: {
			fontStyle: 'italic',
			opacity: '0.6'
		}
	});
</script>

<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import { getLocale } from '$lib/context/locale';
	import type { RuleEntry } from '$lib/rules-reference/types';
	import { translate } from '@songsofdoom/common/localisation';

	interface Props {
		entry: RuleEntry;
	}

	const { entry }: Props = $props();
	const locale = getLocale();
	const title = $derived(translate(entry.title, locale));
	const BodyComponent = $derived(entry.bodies[locale]);
</script>

<section class={styles.ruleEntry} id={entry.slug}>
	<h1 class={styles.ruleTitle}>
		<a href="#{entry.slug}">{title}</a>
	</h1>
	<div class="rule-body">
		{#if BodyComponent}
			<BodyComponent />
		{:else}
			<p class={styles.ruleMissing}>
				<Text
					ca="Contingut no disponible en aquest idioma."
					es="Contenido no disponible en este idioma."
					en="Content not available in this language."
				/>
			</p>
		{/if}
	</div>
</section>
