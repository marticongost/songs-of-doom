<script lang="ts">
	import { page } from '$app/state';
	import type { Entity } from '$lib/catalog/models/entity';
	import CardLevel from '$lib/components/CardLevel.svelte';
</script>

<h1 class="page-title">{page.data.title}</h1>
<CardLevel entity={page.data.entity as Entity} />
