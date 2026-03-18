<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una regla que protege al objetivo de un determinado tipo de daño hasta una cantidad máxima. El
	daño evitado por la invulnerabilidad se aplica por encima de la
	<RuleLink slug="toughness" transform="lowercase" />, pero, a diferencia de esta, no se ve afectada
	por la <RuleLink slug="piercing" transform="lowercase" />.
</p>
<p>
	Si se especifica un tipo de ataque, la regla solo protege contra ese tipo. Si no se especifica
	ninguno, protege contra todos los tipos de daño.
</p>
