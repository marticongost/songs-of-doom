<!--
	@component Active game view — shows the game log during ACTIVE/COMPLETE phases
	and manages narration popups for reading (and acknowledging) story gates.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		gameView: {
			position: 'relative',
			flex: '1 1 auto',
			display: 'flex',
			flexDirection: 'column'
		},
		playerOverlays: {
			...css.column('lg'),
			position: 'absolute',
			left: 0,
			top: 0,
			zIndex: 1
		},
		gameLog: {
			position: 'absolute',
			right: 0,
			top: 0,
			zIndex: 1
		}
	});
</script>

<script lang="ts">
	import GameMap from '$lib/components/game/GameMap.svelte';
	import GameLog from '$lib/components/game/log/GameLog.svelte';
	import NarrationPopup from '$lib/components/game/log/NarrationPopup.svelte';
	import PlayerOverlay from '$lib/components/game/PlayerOverlay.svelte';
	import {
		standardAttributes,
		type StandardAttributeProps
	} from '$lib/components/standardattributes';
	import { getGameStore } from '$lib/context/gamestore';
	import type { PlayerState } from '@songsofdoom/engine';
	import { ProcedureId } from '@songsofdoom/engine';

	interface Props extends StandardAttributeProps {
		// Currently no extra props needed — store comes from context.
	}

	const { ...attributes }: Props = $props();

	const store = getGameStore();

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

	/**
	 * Called when the user clicks "Next" in the NarrationPopup — there are
	 * more unacknowledged narrations ahead.  Acknowledges the current gate
	 * so the store advances to the next narration.
	 */
	function handleNarrationNext(): void {
		store.acknowledgeNarration();
	}

	/**
	 * Whether there are narration entries beyond the current presentation
	 * gate that haven't been acknowledged yet.
	 */
	const hasMoreNarrations = $derived(
		store.journal
			.slice(store.presentedJournalLength)
			.some((e) => e.procedureId === ProcedureId.NarrationEffect && e.state.step)
	);

	// --- Player overlays ---

	/**
	 * Player entries with character names, matched from game meta participants.
	 * Players and participants share the same ordered index.
	 */
	const playerEntries = $derived(
		(store.gameState?.players ?? []).map(
			(player: PlayerState): { player: PlayerState; characterName: string } => ({
				player,
				characterName: player.character.name || `Player ${player.id}`
			})
		)
	);
</script>

<div {...standardAttributes(attributes, styles.gameView)}>
	<GameMap locations={store.gameState?.locations ?? []} />
	<div class={styles.playerOverlays}>
		{#each playerEntries as entry (entry.player.id)}
			<PlayerOverlay player={entry.player} characterName={entry.characterName} />
		{/each}
	</div>
	<GameLog
		class={styles.gameLog}
		journal={store.journal}
		maxVisible={store.presentedJournalLength}
		onNarrationClick={handleNarrationClick}
	/>
</div>

{#if activePopupIndex !== null}
	<NarrationPopup
		journal={store.journal}
		initialIndex={activePopupIndex}
		onClose={handleNarrationClose}
		hasMore={store.narrationPopupIndex !== null && hasMoreNarrations}
		onNext={handleNarrationNext}
	/>
{/if}
