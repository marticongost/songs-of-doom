<!--
	@component Modal dialog for reading narration entries.

	When {@link hasMore} is true (unacknowledged narrations ahead), the
	dialog shows only a single "Next" button and hides the Back/Next
	navigation arrows.  When all pending narrations have been seen,
	Back/Next arrows let the player re-read past entries, and "Close"
	dismisses the dialog.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const styles = css.styles({
		dialog: {
			position: 'fixed',
			inset: '0',
			margin: 'auto',
			width: 'min(90vw, 40em)',
			maxHeight: '80vh',
			background: css.palette.black,
			border: `1px solid ${css.palette.buccaneer}`,
			borderRadius: '4px',
			padding: css.spacing.lg,
			fontFamily: css.fonts.text,
			color: css.text.regularColor,
			display: 'flex',
			flexDirection: 'column',
			gap: css.spacing.md,
			overflow: 'hidden',

			'&::backdrop': {
				background: 'rgba(0, 0, 0, 0.85)'
			},

			'&:not([open])': {
				display: 'none'
			}
		},
		paragraphs: {
			...css.column('sm'),
			overflowY: 'auto',
			flex: '1',
			paddingRight: css.spacing.sm
		},
		paragraph: {
			margin: 0,
			fontStyle: 'italic',
			fontFamily: css.fonts.heading,
			color: css.palette.silk,
			lineHeight: '1.6'
		},
		controls: {
			...css.row('md'),
			alignItems: 'center',
			justifyContent: 'space-between',
			borderTop: `1px solid ${css.palette.buccaneer}`,
			paddingTop: css.spacing.sm
		},
		navGroup: {
			...css.row('sm'),
			alignItems: 'center'
		},
		position: {
			fontFamily: css.fonts.heading,
			fontSize: '0.9em',
			color: css.text.mutedColor,
			minWidth: '4em',
			textAlign: 'center'
		}
	});
</script>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import { getLocale } from '$lib/context/locale';
	import { translate } from '@songsofdoom/common/localisation';
	import { ProcedureId, type JournalEntry, type NarrationEffectState } from '@songsofdoom/engine';

	interface Props {
		/** All journal entries (to find narration entries for navigation). */
		journal: readonly JournalEntry[];
		/** Journal index of the narration entry to display initially. */
		initialIndex: number;
		/** Called when the player closes the dialog (acknowledges the gate). */
		onClose: () => void;
		/**
		 * Whether there are more unacknowledged narration entries after the
		 * current one.  When `true`, a "Next" button is shown instead of
		 * "Close" so the player can advance through pending narrations.
		 */
		hasMore?: boolean;
		/**
		 * Called when the player clicks "Next" to acknowledge the current
		 * narration and advance to the next unacknowledged one.
		 */
		onNext?: () => void;
	}

	const { journal, initialIndex, onClose, hasMore = false, onNext }: Props = $props();

	const locale = getLocale();

	/** Indices (into journal) of all narration entries (excluding completion markers). */
	const narrationIndices = $derived(
		journal.reduce<number[]>((acc, entry, i) => {
			if (entry.procedureId === ProcedureId.NarrationEffect && entry.state.step) {
				acc.push(i);
			}
			return acc;
		}, [])
	);

	/** Position of the initial index within the narrationIndices array. */
	const initialPosition = $derived(narrationIndices.indexOf(initialIndex));

	/** Current position within narrationIndices (0-based). */
	let currentPosition = $state(initialPosition >= 0 ? initialPosition : 0);

	// Keep currentPosition in sync when the page changes the initialIndex
	// (e.g. after clicking "Next" to advance to a new narration gate).
	$effect(() => {
		if (initialPosition >= 0) {
			currentPosition = initialPosition;
		}
	});

	/** The journal index of the currently displayed narration. */
	const currentIndex = $derived(narrationIndices[currentPosition] ?? initialIndex);

	/** The current narration entry state. */
	const currentState = $derived(journal[currentIndex]?.state as NarrationEffectState | undefined);

	const paragraphs = $derived(
		currentState
			? translate(currentState.effect.text, locale)
					.split(/\n+/)
					.filter((p) => p.trim().length > 0)
			: []
	);

	const isFirst = $derived(currentPosition <= 0);
	const isLast = $derived(currentPosition >= narrationIndices.length - 1);

	let dialogElement: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (dialogElement) {
			dialogElement.showModal();
		}
	});

	function close(): void {
		dialogElement?.close();
		onClose();
	}

	function handleAdvance(): void {
		if (hasMore && onNext) {
			onNext();
		} else {
			close();
		}
	}

	function goBack(): void {
		if (!isFirst) currentPosition--;
	}

	function goNext(): void {
		if (!isLast) currentPosition++;
	}

	function handleDialogClick(e: MouseEvent): void {
		if (e.target === dialogElement) {
			close();
		}
	}
</script>

<svelte:head>
	<title>Narration</title>
</svelte:head>

<dialog class={styles.dialog} bind:this={dialogElement} onclose={close} onclick={handleDialogClick}>
	<div class={styles.paragraphs}>
		{#each paragraphs as paragraph (paragraph)}
			<p class={styles.paragraph}>{paragraph}</p>
		{/each}
	</div>

	<div class={styles.controls}>
		{#if hasMore && onNext}
			<!-- Unacknowledged narrations ahead: single "Next" action, no arrows. -->
			<span class={styles.position}>
				{currentPosition + 1} / {narrationIndices.length}
			</span>
			<Button onclick={handleAdvance}>
				<Text ca="Següent" es="Siguiente" en="Next" />
			</Button>
		{:else}
			<!-- Re-reading past narrations: Back/Next arrows + Close. -->
			<div class={styles.navGroup}>
				<Button disabled={isFirst} onclick={goBack}>
					<Text ca="← Enrere" es="← Anterior" en="← Back" />
				</Button>
				<span class={styles.position}>
					{currentPosition + 1} / {narrationIndices.length}
				</span>
				<Button disabled={isLast} onclick={goNext}>
					<Text ca="Següent →" es="Siguiente →" en="Next →" />
				</Button>
			</div>
			<Button onclick={handleAdvance}>
				<Text ca="Tanca" es="Cierra" en="Close" />
			</Button>
		{/if}
	</div>
</dialog>
