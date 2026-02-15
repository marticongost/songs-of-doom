<script module lang="ts">
	export const metadata = { title: 'Capacitat' };
</script>

<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Cada una de les accions, reaccions o regles passives en que es divideix una carta. Es divideixen
	en els següents tipus:
</p>

<ul>
	<li><RuleLink slug="action" label="Accions" /></li>
	<li><RuleLink slug="reaction" label="Reaccions" /></li>
	<li><RuleLink slug="constant" label="Constants" /></li>
</ul>
