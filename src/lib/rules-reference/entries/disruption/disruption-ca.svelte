<script>
	import disruption from '$lib/catalog/data/properties/disruption';
	import Example from '$lib/components/Example.svelte';
	import PropertyChip from '$lib/components/properties/PropertyChip.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Els atacs amb aquesta propietat fan que l'oponent redueixi la seva <RuleLink
		slug="defense"
		transform="lowercase"
	/> en X punts, fins a un mínim de 0.
</p>

<Example>
	Un atac amb <PropertyChip property={disruption.with({ value: 2 })} /> ataca a un oponent amb defensa
	3. Durant l'atac, la defensa efectiva passa a ser 1 (3 - 2 = 1).
</Example>

<Example>
	Un atac amb <PropertyChip property={disruption.with({ value: 3 })} /> ataca a un oponent amb defensa
	2. Durant l'atac, la defensa efectiva passa a ser 0 (2 - 3 = -1, però la defensa mínima és 0).
</Example>
