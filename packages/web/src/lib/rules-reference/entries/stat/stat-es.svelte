<script module lang="ts">
	export const metadata = { title: 'Característica' };
</script>

<script lang="ts">
	import { attributes, type StatType } from '@songsofdoom/game';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
	import StatIcon from '$lib/components/stats/StatIcon.svelte';
</script>

<p>
	Un atributo numérico que refleja la competencia de un personaje en un ámbito físico o mental
	concreto.
</p>

<p>Cada personaje cuenta con las siguientes características:</p>

<ul>
	{#each Object.keys(attributes) as attribute (attribute)}
		<li><StatIcon stat={attribute as StatType} /> <RuleLink slug={attribute} /></li>
	{/each}
</ul>

<p>
	Las características tienen un valor inicial de 3, que representa el valor promedio del aventurero
	medio. Este valor se puede aumentar durante la creación del personaje y a lo largo de su
	progresión posterior, mediante la adquisición de <RuleLink slug="trait" label="rasgos" />,
	<RuleLink slug="ally" label="aliados" /> u <RuleLink slug="item" label="objetos" />. Valores de 4
	y 5 son relativamente habituales, e indican un grado de desarrollo mental o físico más avanzado.
	Valores aún más altos, de 6 o más, son bastante raros y excepcionales, requiriendo una gran
	inversión de tiempo, esfuerzo y entrenamiento por parte de los personajes para alcanzarlos.
</p>
<p>
	Las características también pueden tomar valores inferiores, ya sea por la adquisición de
	desventajas o por efectos temporales. Un valor de 2 representa a alguien con unas aptitudes muy
	limitadas en un ámbito concreto. Un valor de 1 es el mínimo permitido, e indica una incapacidad
	casi total en el ámbito correspondiente.
</p>
