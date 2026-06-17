<!--
	@component Layout for the game route — creates a GameStore and shares it via context.

	The GameStore is instantiated once when entering the route and destroyed when
	navigating away.  All descendant components access it via
	`getContext<GameStore>(GAME_STORE_KEY)`.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { setGameStore } from '$lib/context/gamestore';
	import { GameStore } from '$lib/game/GameStore.svelte';

	let { children } = $props();

	const store = new GameStore();
	setGameStore(store);

	$effect(() => {
		const gameId = page.params.gameId;
		if (gameId) {
			store.connect(gameId);
		}

		return () => {
			store.disconnect();
		};
	});
</script>

{@render children()}
