<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	A rule that protects the target from a certain type of damage up to a maximum amount. The damage
	absorbed by invulnerability applies on top of <RuleLink slug="toughness" transform="lowercase" />,
	but unlike toughness, it is not affected by <RuleLink slug="piercing" transform="lowercase" />.
</p>
<p>
	If an attack type is specified, the rule only protects against that type. If none is specified, it
	protects against all types of damage.
</p>
