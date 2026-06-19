<!--
	@component Game page — lobby during PREPARATION, gameplay during ACTIVE/COMPLETE.

	During PREPARATION the owner can start the game and non-owners can join/leave.
	Once the game starts, the SSE stream delivers journal entries and input events.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		page: {
			...css.column('lg')
		},
		lobby: {
			...css.column('md'),
			maxWidth: '40em'
		},
		section: {
			...css.column('sm')
		},
		sectionTitle: {
			fontWeight: 'bold',
			color: css.text.headingColor
		},
		participantList: {
			...css.column('xs')
		},
		participant: {
			paddingLeft: css.spacing.sm,
			borderLeft: `3px solid ${css.palette.buccaneer}`
		},
		ownerBadge: {
			fontSize: '0.85em',
			color: css.palette.buccaneer
		},
		actions: {
			...css.row('md'),
			alignItems: 'center'
		},
		gameplay: {
			...css.column('md')
		},
		error: {
			color: css.palette.red
		}
	});
</script>

<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
	import Dropdown from '$lib/components/forms/Dropdown.svelte';
	import GameLog from '$lib/components/game/log/GameLog.svelte';
	import NarrationPopup from '$lib/components/game/log/NarrationPopup.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { getGameStore } from '$lib/context/gamestore';
	import { entities, isCampaign } from '@songsofdoom/game';

	const store = getGameStore();
	const user = page.data.user;

	const campaignTitle = $derived.by(() => {
		if (!store.gameMeta?.campaignId) return undefined;
		const entity = entities.get(store.gameMeta.campaignId);
		return entity && isCampaign(entity) ? entity.title : undefined;
	});

	const isOwner = $derived(user != null && store.gameMeta?.ownerId === user.id);
	const isParticipant = $derived(
		user != null && (store.gameMeta?.participants.some((p) => p.userId === user.id) ?? false)
	);
	const isPreparation = $derived(store.gameMeta?.status === 'PREPARATION');
	const isActive = $derived(
		store.gameMeta?.status === 'ACTIVE' || store.gameMeta?.status === 'COMPLETE'
	);

	let selectedCharacterId = $state('');

	// --- Narration popup (page-level, separate from GameLog) ---

	/**
	 * Manual popup index: set when the user clicks a past narration entry
	 * in the GameLog to re-read it.  The auto-popup (from the store's
	 * {@link GameStore.narrationPopupIndex}) takes priority.
	 */
	let manualNarrationPopupIndex = $state<number | null>(null);

	/** Active popup index — auto (new narration gate) takes priority over manual (re-read). */
	const activePopupIndex = $derived(store.narrationPopupIndex ?? manualNarrationPopupIndex);

	function handleNarrationClick(index: number): void {
		manualNarrationPopupIndex = index;
	}

	function handleNarrationClose(): void {
		// If the popup was showing the current narration gate (auto-popup),
		// acknowledge it so the game advances past the gate.
		if (
			store.narrationPopupIndex !== null &&
			activePopupIndex === store.narrationPopupIndex &&
			store.isNarrationGated
		) {
			store.acknowledgeNarration();
		}
		manualNarrationPopupIndex = null;
	}

	let characterOptions = $derived.by(() => {
		// Only show characters not already in the game
		const usedCharacterIds = new Set(store.gameMeta?.participants.map((p) => p.characterId) ?? []);
		return (page.data.characters ?? [])
			.filter((c: { id: number; name: string }) => !usedCharacterIds.has(c.id))
			.map((c: { id: number; name: string }) => ({
				value: String(c.id),
				label: { ca: c.name, es: c.name, en: c.name }
			}));
	});
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
		<!-- PREPARATION lobby -->
		<div class={styles.lobby}>
			<div class={styles.section}>
				<h2 class={styles.sectionTitle}>
					<Text ca="Campanya" es="Campaña" en="Campaign" />
				</h2>
				{#if campaignTitle}
					<p>{campaignTitle.ca}</p>
				{:else}
					<p><Text ca="Desconeguda" es="Desconocida" en="Unknown" /></p>
				{/if}
			</div>

			<div class={styles.section}>
				<h2 class={styles.sectionTitle}>
					<Text ca="Jugadors" es="Jugadores" en="Players" />
				</h2>
				<ul class={styles.participantList}>
					{#each store.gameMeta?.participants ?? [] as p (p.userId)}
						<li class={styles.participant}>
							{p.characterName}
							{#if p.userId === store.gameMeta?.ownerId}
								<span class={styles.ownerBadge}>
									<Text ca=" (creador)" es=" (creador)" en=" (owner)" />
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>

			<div class={styles.actions}>
				{#if isOwner}
					<Button onclick={() => store.startGame()}>
						<Text ca="Començar partida" es="Empezar partida" en="Start game" />
					</Button>
				{:else if isParticipant}
					<Button onclick={() => store.leaveGame()}>
						<Text ca="Abandonar partida" es="Abandonar partida" en="Leave game" />
					</Button>
				{:else}
					<Dropdown
						options={characterOptions}
						value={selectedCharacterId}
						onChange={(v) => (selectedCharacterId = v)}
					/>
					<Button
						disabled={!selectedCharacterId}
						onclick={() => store.joinGame(Number(selectedCharacterId))}
					>
						<Text ca="Unir-se" es="Unirse" en="Join game" />
					</Button>
				{/if}
			</div>
		</div>
	{:else if isActive}
		<!-- ACTIVE / COMPLETE gameplay -->
		<div class={styles.gameplay}>
			<GameLog
				journal={store.journal}
				maxVisible={store.presentedJournalLength}
				onNarrationClick={handleNarrationClick}
			/>
		</div>
	{/if}
</div>

{#if activePopupIndex !== null}
	<NarrationPopup
		journal={store.journal}
		initialIndex={activePopupIndex}
		onClose={handleNarrationClose}
	/>
{/if}
