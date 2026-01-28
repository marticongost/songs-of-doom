<!--
@component
Renders localised text with optional interpolation support.

Supports two interpolation methods:
- **Simple values**: Pass primitives directly as props
- **Snippets**: Pass Svelte snippets for complex content (components, HTML)

Placeholders use the syntax `%(name)` where `name` matches a prop or snippet.

@example Simple text
```svelte
<Text ca="Hola món" es="Hola mundo" en="Hello world" />
```

@example Value interpolation
```svelte
<Text
  ca="La resposta és %(answer)"
  es="La respuesta es %(answer)"
  en="The answer is %(answer)"
  answer={42}
/>
```

@example Snippet interpolation
```svelte
<Text ca="Hola %(user)" es="Hola %(user)" en="Hello %(user)">
  {#snippet user()}
    <strong>{userName}</strong>
  {/snippet}
</Text>
```

@example Mixed interpolation
```svelte
<Text
  ca="%(user) té %(count) missatges"
  es="%(user) tiene %(count) mensajes"
  en="%(user) has %(count) messages"
  count={messages.length}
>
  {#snippet user()}
    <a href="/profile">{userName}</a>
  {/snippet}
</Text>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getLocale } from '$lib/context/locale';

	interface Props {
		/** Catalan text, may contain `%(name)` placeholders */
		ca?: string;
		/** Spanish text, may contain `%(name)` placeholders */
		es?: string;
		/** English text, may contain `%(name)` placeholders */
		en?: string;
		/** Additional props are used as placeholder values (primitives or snippets) */
		[key: string]: unknown;
	}

	const { ca = '', es = '', en = '', ...values }: Props = $props();

	const locale = getLocale();

	type Segment = { type: 'text'; value: string } | { type: 'placeholder'; name: string };

	function parseTemplate(template: string): Segment[] {
		const result: Segment[] = [];
		const regex = /%\((\w+)\)/g;
		let lastIndex = 0;
		let match;

		while ((match = regex.exec(template)) !== null) {
			if (match.index > lastIndex) {
				result.push({ type: 'text', value: template.slice(lastIndex, match.index) });
			}
			result.push({ type: 'placeholder', name: match[1] });
			lastIndex = regex.lastIndex;
		}

		if (lastIndex < template.length) {
			result.push({ type: 'text', value: template.slice(lastIndex) });
		}

		return result;
	}

	const text = $derived(locale === 'ca' ? ca : locale === 'es' ? es : en);
	const segments = $derived(parseTemplate(text));
</script>

{#each segments as segment}<!--
	-->{#if segment.type === 'text'}<!--
		-->{segment.value}<!--
	-->{:else if typeof values[segment.name] === 'function'}<!--
		-->{@render (values[segment.name] as Snippet<[]>)()}<!--
	-->{:else if segment.name in values}<!--
		-->{values[segment.name]}<!--
	-->{:else}<!--
		-->{(() => { throw new Error(`Missing value for placeholder: %(${segment.name})`); })()}<!--
	-->{/if}<!--
-->{/each}
