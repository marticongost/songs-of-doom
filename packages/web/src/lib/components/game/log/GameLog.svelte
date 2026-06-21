<!--
	@component Displays the engine's append-only journal as a readable game log,
	with progressive indentation to represent nested procedure calls (CallStep).

	Dispatches each entry to a procedure-specific renderer component,
	or falls back to GenericLogEntry for unrecognised procedures.
-->
<script lang="ts" module>
	import * as css from '$lib/styles';

	const INDENT_PER_LEVEL = 1; // em

	const styles = css.styles({
		gameLog: {
			...css.column('sm'),
			fontSize: '0.8em'
		},
		entry: {
			...css.row('xs')
		},
		empty: {
			color: css.text.mutedColor,
			fontStyle: 'italic'
		},
		outcome: {
			color: css.text.highlightColor
		},
		icon: {
			height: '0.8em',
			width: 'auto',
			cursor: 'default'
		}
	});
</script>

<script lang="ts">
	import InlineSvg from '$lib/components/InlineSvg.svelte';
	import Text from '$lib/components/localisation/Text.svelte';
	import type { NarrationEffectState, TriggerCapabilityState } from '@songsofdoom/engine';
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
	import { Action, Obligation, Opportunity } from '@songsofdoom/game';
	import { standardAttributes, type StandardAttributeProps } from '../../standardattributes';
	import AddChargesEffectLogEntry from './AddChargesEffectLogEntry .svelte';
	import AddChargesEffectOutcomeEntry from './AddChargesEffectOutcomeEntry.svelte';
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
	import DrawFocusEffectOutcomeEntry from './DrawFocusEffectOutcomeEntry.svelte';
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
	 * For {@link CallStep} entries, builds the called procedure's state
	 * via {@link ProcedureDefinition#createState} so the dispatched
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
	 */
	function getJournalEntryIcon(
		entry: JournalEntry,
		effectiveProcId: string,
		displayState: unknown
	): string {
		const step = getStep(entry);
		if (entry.state.status === 'complete') return 'log/outcome.svg';
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

	// -----------------------------------------------------------------------
	// Component dispatch
	// -----------------------------------------------------------------------

	/** Return type for {@link getEntryComponent}. */
	interface EntryRenderInfo {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		component: any;
		props: Record<string, unknown>;
		effectiveProcId: string;
		outcome?: boolean;
	}

	/**
	 * Maps a procedure id to the component that renders its active entries
	 * (both {@link CallStep} dispatches and {@link InputStep} entries).
	 */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	const mainEntryComponents: Record<string, any> = {
		[ProcedureId.EmitEvent]: EmitEventLogEntry,
		[ProcedureId.RunCampaign]: RunCampaignLogEntry,
		[ProcedureId.RunScenario]: RunScenarioLogEntry,
		[ProcedureId.Chapter]: ChapterLogEntry,
		[ProcedureId.ChapterStartPhase]: ChapterStartPhaseLogEntry,
		[ProcedureId.FocusPhase]: FocusPhaseLogEntry,
		[ProcedureId.TurnsPhase]: TurnsPhaseLogEntry,
		[ProcedureId.DrawPhase]: DrawPhaseLogEntry,
		[ProcedureId.EncounterPhase]: EncounterPhaseLogEntry,
		[ProcedureId.ChapterEndPhase]: ChapterEndPhaseLogEntry,
		[ProcedureId.Turn]: TurnLogEntry,
		[ProcedureId.TurnStartPhase]: TurnStartPhaseLogEntry,
		[ProcedureId.TurnPlayerActionsPhase]: TurnPlayerActionsPhaseLogEntry,
		[ProcedureId.TurnCreatureActionsPhase]: TurnCreatureActionsPhaseLogEntry,
		[ProcedureId.TurnEndPhase]: TurnEndPhaseLogEntry,
		[ProcedureId.AddChargesEffect]: AddChargesEffectLogEntry,
		[ProcedureId.AttachEffect]: AttachEffectLogEntry,
		[ProcedureId.ConferPropertiesEffect]: ConferPropertiesEffectLogEntry,
		[ProcedureId.ConditionalEffect]: ConditionalEffectLogEntry,
		[ProcedureId.DiscardEffect]: DiscardEffectLogEntry,
		[ProcedureId.DiscardFromHandEffect]: DiscardFromHandEffectLogEntry,
		[ProcedureId.DrawCardsEffect]: DrawCardsEffectLogEntry,
		[ProcedureId.DrawFocusEffect]: DrawFocusEffectLogEntry,
		[ProcedureId.EngageEffect]: EngageEffectLogEntry,
		[ProcedureId.ExhaustEffect]: ExhaustEffectLogEntry,
		[ProcedureId.GatherCluesEffect]: GatherCluesEffectLogEntry,
		[ProcedureId.HealEffect]: HealEffectLogEntry,
		[ProcedureId.MoveEffect]: MoveEffectLogEntry,
		[ProcedureId.NarrationEffect]: NarrationEffectLogEntry,
		[ProcedureId.PlayStoryCardsEffect]: PlayStoryCardsEffectLogEntry,
		[ProcedureId.TriggerCapability]: TriggerCapabilityLogEntry
	};

	/**
	 * Maps a procedure id to the component that renders its *outcome*
	 * (shown after the procedure completes and before the parent resumes).
	 */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	const outcomeComponents: Record<string, any> = {
		[ProcedureId.AddChargesEffect]: AddChargesEffectOutcomeEntry,
		[ProcedureId.DrawFocusEffect]: DrawFocusEffectOutcomeEntry
	};

	/**
	 * Returns the component and props to render for a journal entry, or
	 * `undefined` when the entry should produce no visible row in the log.
	 *
	 * Rules (in priority order):
	 * 1. Terminal entries (`status === 'complete'`) whose procedure has an
	 *    outcome component → show the outcome component with the procedure's
	 *    own state.
	 * 2. `RunCampaign.init` — always visible even though it's a ComputeStep.
	 * 3. {@link CallStep} entries → dispatches to the *called* procedure's
	 *    main component, with a synthetic initial state.
	 * 4. {@link InputStep} entries → dispatches to the current procedure's
	 *    main component.
	 * 5. Everything else → `undefined` (hidden).
	 */
	function getEntryComponent(entry: JournalEntry): EntryRenderInfo | undefined {
		const status = entry.state.status;

		// Terminal entries — show outcome if registered
		if (status === 'complete') {
			const outcomeComp = outcomeComponents[entry.procedureId];
			if (outcomeComp) {
				return {
					component: outcomeComp,
					props: { state: entry.state },
					effectiveProcId: entry.procedureId,
					outcome: true
				};
			}
			return undefined;
		}

		// RunCampaign.init — visible even though it's a ComputeStep
		if (entry.procedureId === ProcedureId.RunCampaign && entry.state.step === 'init') {
			return {
				component: RunCampaignLogEntry,
				props: { state: entry.state },
				effectiveProcId: entry.procedureId
			};
		}

		const step = getStep(entry);
		if (!step || !entry.state.step) return undefined;

		// CallStep entries — show the *called* procedure's component
		if (step instanceof CallStep) {
			const calledProcId = getCalledProcedureId(entry);
			if (!calledProcId) return undefined;
			const displayState = buildCalledState(entry) ?? entry.state;
			const comp = mainEntryComponents[calledProcId] ?? GenericLogEntry;
			return {
				component: comp,
				props:
					comp === GenericLogEntry
						? { procedureId: calledProcId, state: displayState as ProcedureState }
						: { state: displayState },
				effectiveProcId: calledProcId
			};
		}

		// InputStep entries — show the current procedure's component
		if (step instanceof InputStep) {
			const comp = mainEntryComponents[entry.procedureId] ?? GenericLogEntry;
			return {
				component: comp,
				props:
					comp === GenericLogEntry
						? { procedureId: entry.procedureId, state: entry.state }
						: { state: entry.state },
				effectiveProcId: entry.procedureId
			};
		}

		return undefined;
	}

	// -----------------------------------------------------------------------
	// Props & rendering
	// -----------------------------------------------------------------------

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
			{@const info = getEntryComponent(entry)}
			{#if info}
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
							src={getJournalEntryIcon(entry, info.effectiveProcId, info.props.state)}
							class={styles.icon}
						/>
					</button>
					{#if info.component === NarrationEffectLogEntry}
						<NarrationEffectLogEntry
							state={info.props.state as NarrationEffectState}
							onclick={() => onNarrationClick?.(i)}
						/>
					{:else}
						<info.component {...info.props} class={info.outcome ? styles.outcome : undefined} />
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
