<script lang="ts">
	import Text from '$lib/components/localisation/Text.svelte';
	import type { TalentEffect } from '@songsofdoom/game';

	interface Props {
		effect: TalentEffect;
	}

	const { effect }: Props = $props();
</script>

<Text
	ca="Posseeix el talent %(talent)"
	es="Posee el talento %(talent)"
	en="Possesses the talent %(talent)"
>
	{#snippet talent()}
		<span class="talent-name">
			<Text {...effect.talent.title} />
		</span>
	{/snippet}
</Text>

<style lang="scss">
	.talent-name {
		font-weight: bold;
		color: var(--talent-color);
	}
</style>
