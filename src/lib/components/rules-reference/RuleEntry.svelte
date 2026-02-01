<!--
@component
Renders a single rule entry with a heading anchor and localised SVX body.

@example
```svelte
<RuleEntry entry={ruleEntry} />
```
-->
<script lang="ts">
	import type { RuleEntry } from '$lib/rules-reference/types';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '$lib/localisation';
	import Text from '$lib/components/localisation/Text.svelte';

	interface Props {
		entry: RuleEntry;
	}

	const { entry }: Props = $props();
	const locale = getLocale();
	const title = $derived(translate(entry.title, locale));
	const BodyComponent = $derived(entry.bodies[locale]);
</script>

<section class="rule-entry" id={entry.slug}>
	<h1 class="rule-title">
		<a href="#{entry.slug}">{title}</a>
	</h1>
	<div class="rule-body">
		{#if BodyComponent}
			<BodyComponent />
		{:else}
			<p class="rule-missing">
				<Text
					ca="Contingut no disponible en aquest idioma."
					es="Contenido no disponible en este idioma."
					en="Content not available in this language."
				/>
			</p>
		{/if}
	</div>
</section>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.rule-entry {
		scroll-margin-top: 4rem;
		padding-block: 1rem;

		&:not(:last-child) {
			border-bottom: var(--panel-separator);
		}

		:global(p) {
			@include rz.vmargin(sm);
		}

		:global(ul) {
			list-style-type: disc;
		}
		:global(li) {
			margin-left: rz.size(md);
			margin-top: rz.size(sm);
		}
	}

	.rule-title {
		font-family: var(--heading-font);
		font-size: 1.5em;
		color: var(--text-heading-color);
		margin-bottom: rz.size(sm);
	}

	.rule-title a {
		color: inherit;
		text-decoration: none;

		&:hover {
			color: var(--text-highlight);
		}

		&:hover:after {
			content: '#';
			margin-left: rz.size(xs);
			font-weight: normal;
			color: var(--text-muted-color);
		}
	}

	.rule-missing {
		font-style: italic;
		opacity: 0.6;
	}
</style>
