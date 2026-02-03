<script module lang="ts">
	export const metadata = { title: 'Característica' };
</script>

<script lang="ts">
	import { attributes, type StatType } from '$lib/catalog/models/stats';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
	import StatIcon from '$lib/components/stats/StatIcon.svelte';
</script>

<p>
	Un atribut numèric que reflecteix la competència d'un personatge en un àmbit físic o mental
	concret.
</p>

<p>Cada personatge compta amb les següents característiques:</p>

<ul>
	{#each Object.keys(attributes) as attribute (attribute)}
		<li><StatIcon stat={attribute as StatType} /> <RuleLink slug={attribute} /></li>
	{/each}
</ul>

<p>
	Les característiques tenen un valor inicial de 3, que representa el valor promig de l'aventurer
	mitjà. Aquest valor es pot augmentar durant la creació del personatge i al llarg de la seva
	progressió posterior, mitjançant l'adquisició de <RuleLink slug="trait" label="trets" />,
	<RuleLink slug="ally" label="aliats" /> o <RuleLink slug="item" label="objectes" />. Valors de 4 i
	5 són relativament habituals, i indiquen un grau de desenvolupament mental o físic més avançat.
	Valors encara més alts, de 6 o més, són força rars i excepcionals, requerint una gran inversió de
	temps, esforç i entrenament per part dels personatges per tal d'assolir-los.
</p>
<p>
	Les característiques també poden prendre valors inferiors, ja sigui per l'adquisició de
	desavantatges o per efectes temporals. Un valor de 2 representa algú amb unes dots molt limitades
	en un àmbit concret. Un valor de 1 és el mínim permès, i indica una incapacitat gairebé total en
	l'àmbit corresponent.
</p>
