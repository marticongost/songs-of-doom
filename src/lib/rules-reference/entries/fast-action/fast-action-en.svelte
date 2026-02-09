<script module lang="ts">
	export const metadata = { title: 'Fast action' };
</script>

<script lang="ts">
	import RuleLink from '$lib/components/rules-reference/RuleLink.svelte';
</script>

<p>
	An <RuleLink slug="action" transform="lowercase" /> that can be performed instantly. Fast actions do
	not consume the player's turn: players can execute as many of them as they want, before or after their
	regular action (or both before and after). Additionally, fast actions do not trigger opportunity attacks
	from engaged enemies.
</p>
