<script>
	import disruption from '$lib/catalog/data/properties/disruption';
	import Example from '$lib/components/Example.svelte';
	import PropertyChip from '$lib/components/properties/PropertyChip.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	Attacks with this property reduce the opponent's <RuleLink slug="defense" transform="lowercase" /> by
	X points, down to a minimum of 0.
</p>

<Example>
	An attack with <PropertyChip property={disruption.with({ value: 2 })} /> targets an opponent with defense
	3. During the attack, the effective defense becomes 1 (3 - 2 = 1).
</Example>

<Example>
	An attack with <PropertyChip property={disruption.with({ value: 3 })} /> targets an opponent with defense
	2. During the attack, the effective defense becomes 0 (2 - 3 = -1, but the minimum defense is 0).
</Example>
