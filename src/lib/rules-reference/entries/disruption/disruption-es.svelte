<script>
	import disruption from '$lib/catalog/data/properties/disruption';
	import Example from '$lib/components/Example.svelte';
	import PropertyChip from '$lib/components/properties/PropertyChip.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Los ataques con esta propiedad hacen que el oponente reduzca su <RuleLink
		slug="defense"
		transform="lowercase"
	/> en X puntos, hasta un mínimo de 0.
</p>

<Example>
	Un ataque con <PropertyChip property={disruption.with({ value: 2 })} /> ataca a un oponente con defensa
	3. Durante el ataque, la defensa efectiva pasa a ser 1 (3 - 2 = 1).
</Example>

<Example>
	Un ataque con <PropertyChip property={disruption.with({ value: 3 })} /> ataca a un oponente con defensa
	2. Durante el ataque, la defensa efectiva pasa a ser 0 (2 - 3 = -1, pero la defensa mínima es 0).
</Example>
