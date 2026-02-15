<!--
@component
A link to an entity's detail page, resolving the locale from context.
Accepts either an Entity object or an entity id string.

```svelte
<EntityLink {entity} />
<EntityLink entity="sword" />
<EntityLink entity="sword" label="custom text" />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { entities } from '@songsofdoom/game';
	import type { Entity } from '@songsofdoom/game';
	import Link from '$lib/components/Link.svelte';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';

	interface Props {
		/** The entity to link to, either as an Entity object or an entity id */
		entity: Entity | string;
		label?: string;
	}

	const { entity, label }: Props = $props();
	const locale = getLocale();
	const resolved = $derived(typeof entity === 'string' ? entities.require(entity) : entity);
</script>

<Link href={resolve('/[locale]/cards/[id]', { locale, id: resolved.variantId })}
	>{label ?? translate(resolved.title, locale)}</Link
>
