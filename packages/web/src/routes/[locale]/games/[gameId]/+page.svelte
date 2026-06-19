<!--
	@component Game page — lobby during PREPARATION, gameplay during ACTIVE/COMPLETE.

	Delegates to <Lobby> and <GameView> components for the two main phases.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		page: {
			...css.column('lg')
		},
		error: {
			color: css.palette.red
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import GameView from '$lib/components/game/GameView.svelte';
	import Lobby from '$lib/components/game/Lobby.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { getGameStore } from '$lib/context/gamestore';

	const store = getGameStore();

	const isPreparation = $derived(store.gameMeta?.status === 'PREPARATION');
	const isActive = $derived(
		store.gameMeta?.status === 'ACTIVE' || store.gameMeta?.status === 'COMPLETE'
	);
</script>

<svelte:head>
	<title>Game — {store.gameId ?? 'Loading…'}</title>
</svelte:head>

<div class={styles.page}>
	{#if store.status === 'connecting'}
		<p><Text ca="Connectant…" es="Conectando…" en="Connecting…" /></p>
	{:else if store.status === 'error'}
		<p class={styles.error}>{store.error}</p>
	{:else if isPreparation}
		<Lobby user={page.data.user} characters={page.data.characters ?? []} />
	{:else if isActive}
		<GameView />
	{/if}
</div>
