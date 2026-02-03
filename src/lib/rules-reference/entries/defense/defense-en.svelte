<script module lang="ts">
	export const metadata = { title: 'Defense' };
</script>

<script lang="ts">
	import Example from '$lib/components/Example.svelte';
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	A modifier conferred by a number of different <RuleLink slug="capability" label="capabilities" />,
	typically in the form of a <RuleLink slug="reaction" transform="lowercase" /> to receiving an attack.
	Defense is subtracted from the attack's proficiency, reducing its chance to cause damage.
</p>

<Example>
	A character with defense 2 receives an attack with proficiency 4. The effective proficiency of the
	attack is reduced to 2 (4 - 2 = 2).
</Example>

<p>
	Defense is cumulative; multiple capabilities that grant defense can be activated against the same
	attack, adding their values together.
</p>

<p>
	In game materials, effects that modify a character's defense are represented with the
	<InlineSvg src="effects/defense.svg" /> icon.
</p>
