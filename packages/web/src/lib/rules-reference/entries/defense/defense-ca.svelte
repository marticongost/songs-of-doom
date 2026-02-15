<script module lang="ts">
	export const metadata = { title: 'Defensa' };
</script>

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Un modificador atorgat per diverses <RuleLink slug="capability" label="capacitats" />, normalment
	en forma de <RuleLink slug="reaction" transform="lowercase" /> en rebre un atac. La defensa es resta
	a la competència de l'atac, reduint les possibilitats de rebre dany.
</p>

<Example>
	Un personatge amb defensa 2 rep un atac amb competència 4. La competència efectiva de l'atac es
	redueix a 2 (4 - 2 = 2).
</Example>

<p>
	La defensa és acumulativa; es poden activar múltiples capacitats que atorguin defensa per
	oposar-se a un mateix atac, sumant els seus valors.
</p>

<p>
	Als materials del joc, els efectes que modifiquen la defensa d'un personatge es representen amb la
	icona <InlineSvg src="effects/defense.svg" />.
</p>
