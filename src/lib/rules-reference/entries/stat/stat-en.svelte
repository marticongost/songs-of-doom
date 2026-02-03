<script module lang="ts">
	export const metadata = { title: 'Stat' };
</script>

<script lang="ts">
	import { attributes, type StatType } from '$lib/catalog/models/stats';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
	import StatIcon from '$lib/components/stats/StatIcon.svelte';
</script>

<p>
	A numeric attribute that reflects a character's competence in a specific physical or mental area.
</p>

<p>Each character has the following stats:</p>

<ul>
	{#each Object.keys(attributes) as attribute (attribute)}
		<li><StatIcon stat={attribute as StatType} /> <RuleLink slug={attribute} /></li>
	{/each}
</ul>

<p>
	Stats have an initial value of 3, representing the average value of a typical adventurer. This
	value can be increased during character creation and throughout subsequent progression, by
	acquiring <RuleLink slug="trait" label="traits" />, <RuleLink slug="ally" label="allies" />, or
	<RuleLink slug="item" label="items" />. Values of 4 and 5 are relatively common, indicating a more
	advanced degree of mental or physical development. Even higher values, of 6 or more, are quite
	rare and exceptional, requiring a great investment of time, effort, and training on the part of
	the characters to achieve them.
</p>
<p>
	Stats can also take lower values, either through the acquisition of disadvantages or due to
	temporary effects. A value of 2 represents someone with very limited aptitude in a given area. A
	value of 1 is the minimum allowed, and indicates a near-total inability in the corresponding area.
</p>
