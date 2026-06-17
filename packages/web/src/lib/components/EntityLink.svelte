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
	import Link from '$lib/components/Link.svelte';
	import { getLocale } from '$lib/context/locale';
	import { entityUrl } from '$lib/urls';
	import { translate } from '@songsofdoom/common/localisation';
	import type { Entity } from '@songsofdoom/game';
	import { entities } from '@songsofdoom/game';

	interface Props {
		/** The entity to link to, either as an Entity object or an entity id */
		entity: Entity | string;

		/**
		 * Optional label to display for the link. If not provided, the entity's title
		 * will be used.
		 */
		label?: string;

		/** The HTML target attribute for the link. */
		target?: string;
	}

	const { entity, label, target }: Props = $props();
	const locale = getLocale();
	const entityObject = $derived(typeof entity === 'string' ? entities.require(entity) : entity);
</script>

<Link href={entityUrl.get(entityObject)} {target}
	>{label ?? translate(entityObject.title, locale)}</Link
>
