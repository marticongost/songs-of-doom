<!--
	@component Displays the engine's append-only journal as a readable game log,
	with progressive indentation to represent nested procedure calls (CallStep).

	Dispatches each entry to a procedure-specific renderer component,
	or falls back to GenericLogEntry for unrecognised procedures.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';
	import {
		CallStep,
		DispatchStep,
		InputStep,
		ProcedureId,
		procedureDefinitions,
		type JournalEntry,
		type ProcedureState,
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

	/**
	 * Returns true when the journal entry should produce a visible row in the log.
	 *
	 * Rules:
	 * - Hide by default.
	 * - Show {@link CallStep} entries (structural procedure invocations).
	 * - Show {@link InputStep} entries (player interaction points).
	 *
	 * Exceptions:
	 * - RunCampaign.init carries the campaign banner and must be visible
	 *   even though it is a ComputeStep.
	 */
	function shouldRenderEntry(entry: JournalEntry): boolean {
		// RunCampaign.init announces the campaign — show it even though it's a ComputeStep.
		if (entry.procedureId === ProcedureId.RunCampaign && entry.state.step === 'init') return true;

		if (!entry.state.step) return false;

		const step = getStep(entry);
		if (!step) return false;

		if (step instanceof CallStep) return true;
		if (step instanceof InputStep) return true;

		return false;
	}

	/**
	 * For {@link CallStep} entries, resolves and returns the parameters
	 * passed to the called procedure. Returns `undefined` for non-CallStep
	 * entries.
	 */
	function getCallStepParams(entry: JournalEntry): Record<string, unknown> | undefined {
		const step = getStep(entry);
		if (!(step instanceof CallStep)) return undefined;
		try {
			return step.parameters(entry.state) as Record<string, unknown>;
		} catch {
			return undefined;
		}
	}

	/**
	 * For {@link CallStep} entries, returns the {@link ProcedureId} of the
	 * called procedure. Returns `undefined` for non-CallStep entries.
	 */
	function getCalledProcedureId(entry: JournalEntry): ProcedureId | undefined {
		const step = getStep(entry);
		if (!(step instanceof CallStep)) return undefined;
		const procId = step.procedureId;
		return typeof procId === 'function' ? procId(entry.state) : procId;
	}

	/**
	 * For {@link CallStep} entries, builds the called procedure's state
	 * via {@link ProcedureDefinition.createState} so the dispatched
	 * component receives the right shape.
	 * Returns `undefined` for non-CallStep entries.
	 */
	function buildCalledState(entry: JournalEntry): Record<string, unknown> | undefined {
		const calledProcId = getCalledProcedureId(entry);
		if (!calledProcId) return undefined;
		const procDef = procedureDefinitions[calledProcId];
		if (!procDef) return undefined;
		const params = getCallStepParams(entry);
		try {
			return procDef.createState(entry.state.game, params) as Record<string, unknown>;
		} catch {
			return undefined;
		}
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

	/**
	 * Returns the icon to display for a journal entry.
	 *
	 * Uses `effectiveProcId` (the called procedure for CallStep dispatches)
	 * so the icon matches the rendered component.
	 */
	function getJournalEntryIcon(
		entry: JournalEntry,
		effectiveProcId: string,
		displayState: unknown
	): string {
		const step = getStep(entry);
		if (step instanceof InputStep) return 'log/input.svg';
		if (effectiveProcId === ProcedureId.NarrationEffect) return 'log/narration.svg';
		if (effectiveProcId === ProcedureId.EmitEvent) return 'log/event.svg';
		if (effectiveProcId === ProcedureId.TriggerCapability) {
			const capabilityRef = displayState as TriggerCapabilityState;
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
				{@const step = getStep(entry)}
				{@const calledProcId = step instanceof CallStep ? getCalledProcedureId(entry) : undefined}
				{@const effectiveProcId = calledProcId ?? entry.procedureId}
				{@const displayState = ((step instanceof CallStep ? buildCalledState(entry) : undefined) ??
					entry.state) as unknown}
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
						<InlineSvg
							src={getJournalEntryIcon(entry, effectiveProcId, displayState)}
							class={styles.icon}
						/>
					</button>
					{#if effectiveProcId === ProcedureId.EmitEvent}
						<EmitEventLogEntry state={displayState as EmitEventState} />
					{:else if effectiveProcId === ProcedureId.RunCampaign}
						<RunCampaignLogEntry state={displayState as RunCampaignState} />
					{:else if effectiveProcId === ProcedureId.RunScenario}
						<RunScenarioLogEntry state={displayState as RunScenarioState} />
					{:else if effectiveProcId === ProcedureId.Chapter}
						<ChapterLogEntry state={displayState as ChapterState} />
					{:else if effectiveProcId === ProcedureId.ChapterStartPhase}
						<ChapterStartPhaseLogEntry state={displayState as ChapterStartState} />
					{:else if effectiveProcId === ProcedureId.FocusPhase}
						<FocusPhaseLogEntry state={displayState as FocusPhaseState} />
					{:else if effectiveProcId === ProcedureId.TurnsPhase}
						<TurnsPhaseLogEntry state={displayState as TurnsPhaseState} />
					{:else if effectiveProcId === ProcedureId.DrawPhase}
						<DrawPhaseLogEntry state={displayState as DrawPhaseState} />
					{:else if effectiveProcId === ProcedureId.EncounterPhase}
						<EncounterPhaseLogEntry state={displayState as EncounterPhaseState} />
					{:else if effectiveProcId === ProcedureId.ChapterEndPhase}
						<ChapterEndPhaseLogEntry state={displayState as ChapterEndState} />
					{:else if effectiveProcId === ProcedureId.Turn}
						<TurnLogEntry state={displayState as TurnState} />
					{:else if effectiveProcId === ProcedureId.TurnStartPhase}
						<TurnStartPhaseLogEntry state={displayState as TurnStartPhaseState} />
					{:else if effectiveProcId === ProcedureId.TurnPlayerActionsPhase}
						<TurnPlayerActionsPhaseLogEntry state={displayState as TurnPlayerActionsPhaseState} />
					{:else if effectiveProcId === ProcedureId.TurnCreatureActionsPhase}
						<TurnCreatureActionsPhaseLogEntry
							state={displayState as TurnCreatureActionsPhaseState}
						/>
					{:else if effectiveProcId === ProcedureId.TurnEndPhase}
						<TurnEndPhaseLogEntry state={displayState as TurnEndPhaseState} />
					{:else if effectiveProcId === ProcedureId.AttachEffect}
						<AttachEffectLogEntry state={displayState as AttachEffectProcedureState} />
					{:else if effectiveProcId === ProcedureId.ConferPropertiesEffect}
						<ConferPropertiesEffectLogEntry state={displayState as ConferPropertiesEffectState} />
					{:else if effectiveProcId === ProcedureId.ConditionalEffect}
						<ConditionalEffectLogEntry state={displayState as ConditionalEffectState} />
					{:else if effectiveProcId === ProcedureId.DiscardEffect}
						<DiscardEffectLogEntry state={displayState as DiscardEffectState} />
					{:else if effectiveProcId === ProcedureId.DiscardFromHandEffect}
						<DiscardFromHandEffectLogEntry state={displayState as DiscardFromHandEffectState} />
					{:else if effectiveProcId === ProcedureId.DrawCardsEffect}
						<DrawCardsEffectLogEntry state={displayState as DrawCardsEffectState} />
					{:else if effectiveProcId === ProcedureId.DrawFocusEffect}
						<DrawFocusEffectLogEntry state={displayState as DrawFocusState} />
					{:else if effectiveProcId === ProcedureId.EngageEffect}
						<EngageEffectLogEntry state={displayState as EngageEffectState} />
					{:else if effectiveProcId === ProcedureId.ExhaustEffect}
						<ExhaustEffectLogEntry state={displayState as ExhaustEffectState} />
					{:else if effectiveProcId === ProcedureId.GatherCluesEffect}
						<GatherCluesEffectLogEntry state={displayState as GatherCluesEffectState} />
					{:else if effectiveProcId === ProcedureId.HealEffect}
						<HealEffectLogEntry state={displayState as HealEffectState} />
					{:else if effectiveProcId === ProcedureId.MoveEffect}
						<MoveEffectLogEntry state={displayState as MoveEffectState} />
					{:else if effectiveProcId === ProcedureId.NarrationEffect}
						<NarrationEffectLogEntry
							state={displayState as NarrationEffectState}
							onclick={() => onNarrationClick?.(i)}
						/>
					{:else if effectiveProcId === ProcedureId.PlayStoryCardsEffect}
						<PlayStoryCardsEffectLogEntry state={displayState as PlayStoryCardsEffectState} />
					{:else if effectiveProcId === ProcedureId.TriggerCapability}
						<TriggerCapabilityLogEntry state={displayState as TriggerCapabilityState} />
					{:else}
						<GenericLogEntry procedureId={effectiveProcId} state={displayState as ProcedureState} />
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
