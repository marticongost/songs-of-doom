<!--
	@component Displays the engine's append-only journal as a readable game log,
	with progressive indentation to represent nested procedure calls (CallStep).

	Dispatches each entry to a procedure-specific renderer component,
	or falls back to GenericLogEntry for unrecognised procedures.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';
	import {
		ComputeStep,
		DispatchStep,
		ForEachStep,
		InputStep,
		ProcedureId,
		procedureDefinitions,
		type JournalEntry,
		type Step
	} from '@songsofdoom/engine';

	const INDENT_PER_LEVEL = 1; // em

	const styles = css.styles({
		gameLog: {
			...css.column('sm')
		},
		entry: {
			...css.row('xs')
		},
		empty: {
			color: css.text.mutedColor,
			fontStyle: 'italic'
		},
		icon: {
			height: '0.8em',
			width: 'auto',
			cursor: 'default'
		}
	});

	/**
	 * Resolves the {@link Step} that produced the given journal entry, or
	 * `undefined` when the procedure or step name cannot be found.
	 */
	function getStep(entry: JournalEntry): Step | undefined {
		const procDef = procedureDefinitions[entry.procedureId];
		if (!procDef) return undefined;
		const stepName = entry.state.step;
		if (!stepName) return undefined;

		// If this entry is a ForEachStep loop-body step, look up its definition
		// inside the parent ForEachStep's sub-steps.
		const loopParentStepId = (entry as unknown as Record<string, unknown>)._loopParentStepId as
			| string
			| undefined;
		const parentStep = loopParentStepId ? procDef.steps[loopParentStepId] : undefined;
		const parentSteps = (parentStep as unknown as { steps?: Record<string, unknown> } | undefined)
			?.steps;
		let step = (parentSteps ? parentSteps[stepName] : procDef.steps[stepName]) as Step | undefined;

		// Resolve DispatchStep chains to find the concrete step type.
		// DispatchSteps are transparent wrappers — the real step (e.g. an
		// InputStep) is determined at runtime by the factory.
		while (step instanceof DispatchStep) {
			step = step.factory(entry.state);
		}

		return step;
	}

	function isInputStep(entry: JournalEntry): boolean {
		return getStep(entry) instanceof InputStep;
	}

	/**
	 * Returns true for parent-procedure entries that serve only as structural
	 * containers — their first step acts as a header, but subsequent steps
	 * should not produce their own visible rows (children still render).
	 */
	function isStructuralOnlyEntry(entry: JournalEntry): boolean {
		const stepName = entry.state.step;
		if (!stepName) return false;

		// RunScenario: only the "init" step shows the scenario banner.
		// "emit" and "beginPlay" are structural wrappers whose children
		// (EmitEvent / Chapter) handle their own display.
		if (entry.procedureId === ProcedureId.RunScenario && stepName !== 'init') return true;

		// Chapter: only the "chapterStartPhase" step shows the chapter header.
		if (entry.procedureId === ProcedureId.Chapter && stepName !== 'chapterStartPhase') return true;

		// Turn: only the "turnStartPhase" step shows the turn header.
		if (entry.procedureId === ProcedureId.Turn && stepName !== 'turnStartPhase') return true;

		// EmitEvent: init shows the event name; invokeReaction is a structural
		// call to TriggerCapability whose children handle the reaction display.
		if (entry.procedureId === ProcedureId.EmitEvent && stepName === 'invokeReaction') return true;

		return false;
	}

	/**
	 * Returns true when the journal entry should produce a visible row in the log.
	 *
	 * Hides ComputeSteps (internal mutations), ForEachSteps (iteration
	 * constructs), structural-only parent entries (see
	 * {@link isStructuralOnlyEntry}), and entries without a resolved step.
	 *
	 * EmitEvent's init step is an exception: although technically a ComputeStep
	 * (a plain function auto-wrapped), it carries the event name for display.
	 */
	function shouldRenderEntry(entry: JournalEntry): boolean {
		// NarrationEffect is always visible — its sole purpose is to be shown.
		// Only render the "record" step entry; the completion marker (which has
		// no `step`) carries the same procedureId but is an internal marker.
		if (entry.procedureId === ProcedureId.NarrationEffect) return !!entry.state.step;

		if (!entry.state.step) return false;

		const step = getStep(entry);
		if (!step) return false;

		// EmitEvent's init step carries the event name for display — always show it.
		if (entry.procedureId === ProcedureId.EmitEvent && entry.state.step === 'init') return true;

		// ForEachSteps are structural iteration constructs — hidden.
		if (step instanceof ForEachStep) return false;

		// ComputeSteps are internal mutations — hidden.
		if (step instanceof ComputeStep) return false;

		// Structural-only parent entries — hidden (children still render).
		if (isStructuralOnlyEntry(entry)) return false;

		return true;
	}

	function computeDepths(journal: readonly JournalEntry[]): number[] {
		const depths: number[] = [];
		for (let i = 0; i < journal.length; i++) {
			let depth = 0;
			let current: number | undefined = journal[i].parentIndex;
			while (current !== undefined) {
				depth++;
				current = journal[current].parentIndex;
			}
			depths.push(depth);
		}
		return depths;
	}

	function getJournalEntryIcon(entry: JournalEntry): string {
		if (isInputStep(entry)) return 'log/input.svg';
		const procId = entry.procedureId;
		if (procId === ProcedureId.EmitEvent) return 'log/event.svg';
		if (procId === ProcedureId.NarrationEffect) return 'log/narration.svg';
		if (procId === ProcedureId.TriggerCapability) {
			const capabilityRef = entry.state as TriggerCapabilityState;
			const capability = entry.state.game.requireCapability(capabilityRef);
			if (capability instanceof Opportunity) return 'capabilities/opportunity.svg';
			if (capability instanceof Obligation) return 'capabilities/obligation.svg';
			if (capability instanceof Action) return 'capabilities/action.svg';
		}
		return 'log/call.svg';
	}
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import type {
		AttachEffectProcedureState,
		ChapterEndState,
		ChapterStartState,
		ChapterState,
		ConditionalEffectState,
		ConferPropertiesEffectState,
		DiscardEffectState,
		DiscardFromHandEffectState,
		DrawCardsEffectState,
		DrawFocusState,
		DrawPhaseState,
		EmitEventState,
		EncounterPhaseState,
		EngageEffectState,
		ExhaustEffectState,
		FocusPhaseState,
		GatherCluesEffectState,
		HealEffectState,
		MoveEffectState,
		NarrationEffectState,
		PlayStoryCardsEffectState,
		RunCampaignState,
		RunScenarioState,
		TriggerCapabilityState,
		TurnCreatureActionsPhaseState,
		TurnEndPhaseState,
		TurnPlayerActionsPhaseState,
		TurnStartPhaseState,
		TurnState,
		TurnsPhaseState
	} from '@songsofdoom/engine';
	import { Action, Obligation, Opportunity } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../../standardattributes';
	import AttachEffectLogEntry from './AttachEffectLogEntry.svelte';
	import ChapterEndPhaseLogEntry from './ChapterEndPhaseLogEntry.svelte';
	import ChapterLogEntry from './ChapterLogEntry.svelte';
	import ChapterStartPhaseLogEntry from './ChapterStartPhaseLogEntry.svelte';
	import ConditionalEffectLogEntry from './ConditionalEffectLogEntry.svelte';
	import ConferPropertiesEffectLogEntry from './ConferPropertiesEffectLogEntry.svelte';
	import DiscardEffectLogEntry from './DiscardEffectLogEntry.svelte';
	import DiscardFromHandEffectLogEntry from './DiscardFromHandEffectLogEntry.svelte';
	import DrawCardsEffectLogEntry from './DrawCardsEffectLogEntry.svelte';
	import DrawFocusEffectLogEntry from './DrawFocusEffectLogEntry.svelte';
	import DrawPhaseLogEntry from './DrawPhaseLogEntry.svelte';
	import EmitEventLogEntry from './EmitEventLogEntry.svelte';
	import EncounterPhaseLogEntry from './EncounterPhaseLogEntry.svelte';
	import EngageEffectLogEntry from './EngageEffectLogEntry.svelte';
	import ExhaustEffectLogEntry from './ExhaustEffectLogEntry.svelte';
	import FocusPhaseLogEntry from './FocusPhaseLogEntry.svelte';
	import GatherCluesEffectLogEntry from './GatherCluesEffectLogEntry.svelte';
	import GenericLogEntry from './GenericLogEntry.svelte';
	import HealEffectLogEntry from './HealEffectLogEntry.svelte';
	import MoveEffectLogEntry from './MoveEffectLogEntry.svelte';
	import NarrationEffectLogEntry from './NarrationEffectLogEntry.svelte';
	import PlayStoryCardsEffectLogEntry from './PlayStoryCardsEffectLogEntry.svelte';
	import RunCampaignLogEntry from './RunCampaignLogEntry.svelte';
	import RunScenarioLogEntry from './RunScenarioLogEntry.svelte';
	import TriggerCapabilityLogEntry from './TriggerCapabilityLogEntry.svelte';
	import TurnCreatureActionsPhaseLogEntry from './TurnCreatureActionsPhaseLogEntry.svelte';
	import TurnEndPhaseLogEntry from './TurnEndPhaseLogEntry.svelte';
	import TurnLogEntry from './TurnLogEntry.svelte';
	import TurnPlayerActionsPhaseLogEntry from './TurnPlayerActionsPhaseLogEntry.svelte';
	import TurnsPhaseLogEntry from './TurnsPhaseLogEntry.svelte';
	import TurnStartPhaseLogEntry from './TurnStartPhaseLogEntry.svelte';

	interface Props extends StandardAttributeProps {
		journal: readonly JournalEntry[];
		/** How many journal entries are visible to this client. Defaults to all. */
		maxVisible?: number;
		/** Called when the player clicks a narration entry to re-read it. */
		onNarrationClick?: (index: number) => void;
	}

	const { journal, maxVisible = journal.length, onNarrationClick, ...attributes }: Props = $props();
	const depths = $derived(computeDepths(journal));

	const visibleJournal = $derived(journal.slice(0, maxVisible));
</script>

<div {...standardAttributes(attributes, styles.gameLog)}>
	{#if visibleJournal.length === 0}
		<p class={styles.empty}>
			<Text ca="Cap entrada al registre" es="Sin entradas en el registro" en="No log entries" />
		</p>
	{:else}
		{#each visibleJournal as entry, i (i)}
			{#if shouldRenderEntry(entry)}
				{@const procId = entry.procedureId}
				<div class={styles.entry} style="margin-left: {depths[i] * INDENT_PER_LEVEL}em">
					<button
						onclick={(e) => {
							if (e.ctrlKey) {
								console.log(entry);
								e.stopPropagation();
								e.preventDefault();
							}
						}}
					>
						<InlineSvg src={getJournalEntryIcon(entry)} class={styles.icon} />
					</button>
					{#if procId === ProcedureId.EmitEvent}
						<EmitEventLogEntry state={entry.state as EmitEventState} />
					{:else if procId === ProcedureId.RunCampaign}
						<RunCampaignLogEntry state={entry.state as RunCampaignState} />
					{:else if procId === ProcedureId.RunScenario}
						<RunScenarioLogEntry state={entry.state as RunScenarioState} />
					{:else if procId === ProcedureId.Chapter}
						<ChapterLogEntry state={entry.state as ChapterState} />
					{:else if procId === ProcedureId.ChapterStartPhase}
						<ChapterStartPhaseLogEntry state={entry.state as ChapterStartState} />
					{:else if procId === ProcedureId.FocusPhase}
						<FocusPhaseLogEntry state={entry.state as FocusPhaseState} />
					{:else if procId === ProcedureId.TurnsPhase}
						<TurnsPhaseLogEntry state={entry.state as TurnsPhaseState} />
					{:else if procId === ProcedureId.DrawPhase}
						<DrawPhaseLogEntry state={entry.state as DrawPhaseState} />
					{:else if procId === ProcedureId.EncounterPhase}
						<EncounterPhaseLogEntry state={entry.state as EncounterPhaseState} />
					{:else if procId === ProcedureId.ChapterEndPhase}
						<ChapterEndPhaseLogEntry state={entry.state as ChapterEndState} />
					{:else if procId === ProcedureId.Turn}
						<TurnLogEntry state={entry.state as TurnState} />
					{:else if procId === ProcedureId.TurnStartPhase}
						<TurnStartPhaseLogEntry state={entry.state as TurnStartPhaseState} />
					{:else if procId === ProcedureId.TurnPlayerActionsPhase}
						<TurnPlayerActionsPhaseLogEntry state={entry.state as TurnPlayerActionsPhaseState} />
					{:else if procId === ProcedureId.TurnCreatureActionsPhase}
						<TurnCreatureActionsPhaseLogEntry
							state={entry.state as TurnCreatureActionsPhaseState}
						/>
					{:else if procId === ProcedureId.TurnEndPhase}
						<TurnEndPhaseLogEntry state={entry.state as TurnEndPhaseState} />
					{:else if procId === ProcedureId.AttachEffect}
						<AttachEffectLogEntry state={entry.state as AttachEffectProcedureState} />
					{:else if procId === ProcedureId.ConferPropertiesEffect}
						<ConferPropertiesEffectLogEntry state={entry.state as ConferPropertiesEffectState} />
					{:else if procId === ProcedureId.ConditionalEffect}
						<ConditionalEffectLogEntry state={entry.state as ConditionalEffectState} />
					{:else if procId === ProcedureId.DiscardEffect}
						<DiscardEffectLogEntry state={entry.state as DiscardEffectState} />
					{:else if procId === ProcedureId.DiscardFromHandEffect}
						<DiscardFromHandEffectLogEntry state={entry.state as DiscardFromHandEffectState} />
					{:else if procId === ProcedureId.DrawCardsEffect}
						<DrawCardsEffectLogEntry state={entry.state as DrawCardsEffectState} />
					{:else if procId === ProcedureId.DrawFocusEffect}
						<DrawFocusEffectLogEntry state={entry.state as DrawFocusState} />
					{:else if procId === ProcedureId.EngageEffect}
						<EngageEffectLogEntry state={entry.state as EngageEffectState} />
					{:else if procId === ProcedureId.ExhaustEffect}
						<ExhaustEffectLogEntry state={entry.state as ExhaustEffectState} />
					{:else if procId === ProcedureId.GatherCluesEffect}
						<GatherCluesEffectLogEntry state={entry.state as GatherCluesEffectState} />
					{:else if procId === ProcedureId.HealEffect}
						<HealEffectLogEntry state={entry.state as HealEffectState} />
					{:else if procId === ProcedureId.MoveEffect}
						<MoveEffectLogEntry state={entry.state as MoveEffectState} />
					{:else if procId === ProcedureId.NarrationEffect}
						<NarrationEffectLogEntry
							state={entry.state as NarrationEffectState}
							onclick={() => onNarrationClick?.(i)}
						/>
					{:else if procId === ProcedureId.PlayStoryCardsEffect}
						<PlayStoryCardsEffectLogEntry state={entry.state as PlayStoryCardsEffectState} />
					{:else if procId === ProcedureId.TriggerCapability}
						<TriggerCapabilityLogEntry state={entry.state as TriggerCapabilityState} />
					{:else}
						<GenericLogEntry procedureId={procId} state={entry.state} />
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
