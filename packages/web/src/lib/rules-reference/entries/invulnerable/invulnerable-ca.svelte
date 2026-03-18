<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una regla que protegeix l'objectiu d'un cert tipus de dany fins a una quantitat màxima. El dany
	evitat per la invulnerabilitat s'aplica a sobre de la
	<RuleLink slug="toughness" transform="lowercase" />, però, a diferència d'aquesta, no es veu
	afectada per la <RuleLink slug="piercing" transform="lowercase" />.
</p>
<p>
	Si s'especifica un tipus d'atac, la regla només protegeix contra aquell tipus. Si no se
	n'especifica cap, protegeix contra tots els tipus de dany.
</p>
