<!--
@component
A cross-reference link to another rule in the rules reference page.
Automatically resolves the localised title from the rule's slug.

Usage in SVX files:
```svelte
<script>
  import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

See <RuleLink slug="weapon" /> for details.
```
-->
<script lang="ts">
	import { getLocale } from '$lib/context/locale';
	import { getRuleEntry } from '$lib/rules-reference';
	import { translate } from '$lib/localisation';

	interface Props {
		/** The slug of the rule to link to */
		slug: string;
		label?: string;
		transform?: 'lowercase';
	}

	const { slug, label, transform }: Props = $props();
	const locale = getLocale();
	const entry = $derived(getRuleEntry(slug));
	const getLinkLabel = $derived(() => {
		let linkLabel = label ?? (entry ? translate(entry.title, locale) : slug);
		if (transform === 'lowercase') {
			linkLabel = linkLabel.toLocaleLowerCase();
		}
		return linkLabel;
	});
</script>

<a href="#{slug}" class="rule-link">{getLinkLabel()}</a>

<style lang="scss">
	@use '@reguitzell/styles' as rz;

	.rule-link {
		text-decoration: underline;
		color: var(--link-color);

		&:hover {
			color: var(--link-hover-color);
		}
	}
</style>
