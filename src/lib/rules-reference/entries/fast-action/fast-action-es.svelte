<script module lang="ts">
	export const metadata = { title: 'Acción rápida' };
</script>

<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Una <RuleLink slug="action" transform="lowercase" /> que se puede ejecutar de forma instantánea. Las
	acciones rápidas no consumen el turno del jugador: los jugadores pueden ejecutar tantas como quieran,
	antes o después de su acción normal (o tanto antes como después). Además, las acciones rápidas no provocan
	ataques de oportunidad de enemigos trabados.
</p>
