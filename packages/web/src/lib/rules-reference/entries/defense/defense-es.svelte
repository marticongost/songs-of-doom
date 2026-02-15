<script module lang="ts">
	export const metadata = { title: 'Defensa' };
</script>

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Un modificador otorgado por diversas <RuleLink slug="capability" label="capacidades" />,
	normalmente en forma de <RuleLink slug="reaction" transform="lowercase" /> al recibir un ataque. La
	defensa se resta a la competencia del ataque, reduciendo las posibilidades de recibir daño.
</p>

<Example>
	Un personaje con defensa 2 recibe un ataque con competencia 4. La competencia efectiva del ataque
	se reduce a 2 (4 - 2 = 2).
</Example>

<p>
	La defensa es acumulativa; se pueden activar múltiples capacidades que otorguen defensa para
	oponerse a un mismo ataque, sumando sus valores.
</p>

<p>
	En los materiales del juego, los efectos que modifican la defensa de un personaje se representan
	con el icono <InlineSvg src="effects/defense.svg" />.
</p>
