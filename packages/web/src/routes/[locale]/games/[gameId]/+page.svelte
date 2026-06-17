<!--
	@component Game page — placeholder for Phase 7 (Game UI).

	TODO: GameBoard, PlayerArea, CardDisplay, GameControls, GameLog, ReactionPrompt.
-->
<script lang="ts">
	import { getGameStore } from '$lib/context/gamestore';

	const store = getGameStore();
</script>

<svelte:head>
	<title>Game — {store.gameId ?? 'Loading…'}</title>
</svelte:head>

{#if store.status === 'connecting'}
	<p>Connecting to game…</p>
{:else if store.status === 'error'}
	<p class="error">{store.error}</p>
{:else}
	<p>Game ID: {store.gameId}</p>
	<p>Status: {store.status}</p>
	<p>Journal entries: {store.journalLength}</p>
{/if}

<style>
	.error {
		color: red;
	}
</style>
