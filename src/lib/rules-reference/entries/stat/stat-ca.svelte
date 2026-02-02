<script module lang="ts">
	export const metadata = { title: 'Característica' };
</script>

<script lang="ts">
	import { stats } from '$lib/catalog/models/stats';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Un atribut numèric que reflecteix la competència d'un personatge en un àmbit físic o mental
	concret.
</p>

<p>Cada personatge compta amb les següents característiques:</p>

<ul>
	{#each Object.keys(stats) as slug (slug)}
		<li><RuleLink {slug} /></li>
	{/each}
</ul>
