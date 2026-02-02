<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una regla amb un valor numèric que indica la capacitat d'un atac per travessar les defenses de
	l'objectiu. Un atac amb penetració ignora una part de la
	<RuleLink slug="toughness" transform="lowercase" /> de l'objectiu igual al valor de penetració.
</p>
