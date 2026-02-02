<script module lang="ts">
	export const metadata = { title: 'Reacció' };
</script>

<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una <RuleLink slug="capability" transform="lowercase" /> que s'activa quan es produeix un esdeveniment
	específic. Les reaccions permeten als personatges respondre a diferents situacions del joc, durant i
	fora del seu torn.
</p>

<p>Segons la seva obligatorietat, les reaccions es classifiquen en dos grups:</p>

<ul>
	<li>
		<RuleLink slug="opportunity" label="Oportunitats" />: s'executen només si el seu propietari ho
		vol
	</li>
	<li>
		<RuleLink slug="obligation" label="Obligacions" />: s'executen sempre, de forma obligatòria
	</li>
</ul>
