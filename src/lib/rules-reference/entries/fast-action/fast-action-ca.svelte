<script module lang="ts">
	export const metadata = { title: 'Acció ràpida' };
</script>

<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una <RuleLink slug="action" transform="lowercase" /> que es pot executar de forma instantània. Les accions
	ràpides no consumeixen el torn del jugador: els jugadors poden executar-ne tantes com vulguin, abans
	o després de la seva acció normal (o tant abans com després). A més, les accions ràpides no provoquen
	atacs d'oportunitat d'enemics enfrontats.
</p>
