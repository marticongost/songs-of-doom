/* eslint-disable @typescript-eslint/no-explicit-any */
import { emitEvent } from '../procedures/core/emitevent';
import { resolveTarget } from '../procedures/core/resolvetarget';
import { triggerCapability } from '../procedures/core/triggercapability';
import { attachEffectProc } from '../procedures/effects/attachproc';
import { conditionalEffectProc } from '../procedures/effects/conditionalproc';
import { conferPropertiesEffectProc } from '../procedures/effects/conferpropertiesproc';
import { discardFromHandEffectProc } from '../procedures/effects/discardfromhandproc';
import { discardEffectProc } from '../procedures/effects/discardproc';
import { drawCardsEffectProc } from '../procedures/effects/drawcardsproc';
import { drawFocusEffectProc } from '../procedures/effects/drawfocusproc';
import { engageEffectProc } from '../procedures/effects/engageproc';
import { exhaustEffectProc } from '../procedures/effects/exhaustproc';
import { gatherCluesEffectProc } from '../procedures/effects/gathercluesproc';
import { healEffectProc } from '../procedures/effects/healproc';
import { moveEffectProc } from '../procedures/effects/moveproc';
import { runCampaign } from '../procedures/gamesequence/campaign/runcampaign';
import { chapter } from '../procedures/gamesequence/chapters/chapter';
import { chapterEndPhase } from '../procedures/gamesequence/chapters/chapterendphase';
import { chapterStartPhase } from '../procedures/gamesequence/chapters/chapterstartphase';
import { drawPhase } from '../procedures/gamesequence/chapters/drawphase';
import { encounterPhase } from '../procedures/gamesequence/chapters/encounterphase';
import { focusPhase } from '../procedures/gamesequence/chapters/focusphase';
import { turnsPhase } from '../procedures/gamesequence/chapters/turnsphase';
import { runScenario } from '../procedures/gamesequence/scenarios/runscenario';
import { turn } from '../procedures/gamesequence/turns/turn';
import { turnCreatureActionsPhase } from '../procedures/gamesequence/turns/turncreatureactionsphase';
import { turnEndPhase } from '../procedures/gamesequence/turns/turnendphase';
import { turnPlayerActionsPhase } from '../procedures/gamesequence/turns/turnplayeractionsphase';
import { turnStartPhase } from '../procedures/gamesequence/turns/turnstartphase';
import { ProcedureDefinition } from './procedure';
import { ProcedureId } from './procedureid';

export const procedureDefinitions: Record<ProcedureId, ProcedureDefinition<any>> = {
	// Stub for unimplemented procedures
	[ProcedureId.Unimplemented]: new ProcedureDefinition({
		id: ProcedureId.Unimplemented,
		steps: {
			noop: () => undefined
		}
	}),
	[ProcedureId.UnimplementedAlt]: new ProcedureDefinition({
		id: ProcedureId.UnimplementedAlt,
		steps: {
			noop: () => undefined
		}
	}),

	// Core
	[ProcedureId.TriggerCapability]: triggerCapability,
	[ProcedureId.EmitEvent]: emitEvent,
	[ProcedureId.ResolveTarget]: resolveTarget,

	// Game sequence
	[ProcedureId.RunCampaign]: runCampaign,
	[ProcedureId.RunScenario]: runScenario,
	[ProcedureId.Chapter]: chapter,
	[ProcedureId.ChapterStartPhase]: chapterStartPhase,
	[ProcedureId.FocusPhase]: focusPhase,
	[ProcedureId.TurnsPhase]: turnsPhase,
	[ProcedureId.DrawPhase]: drawPhase,
	[ProcedureId.EncounterPhase]: encounterPhase,
	[ProcedureId.ChapterEndPhase]: chapterEndPhase,
	[ProcedureId.Turn]: turn,
	[ProcedureId.TurnStartPhase]: turnStartPhase,
	[ProcedureId.TurnPlayerActionsPhase]: turnPlayerActionsPhase,
	[ProcedureId.TurnCreatureActionsPhase]: turnCreatureActionsPhase,
	[ProcedureId.TurnEndPhase]: turnEndPhase,

	// Effects
	[ProcedureId.AttachEffect]: attachEffectProc,
	[ProcedureId.ConferPropertiesEffect]: conferPropertiesEffectProc,
	[ProcedureId.ConditionalEffect]: conditionalEffectProc,
	[ProcedureId.DiscardEffect]: discardEffectProc,
	[ProcedureId.DiscardFromHandEffect]: discardFromHandEffectProc,
	[ProcedureId.DrawCardsEffect]: drawCardsEffectProc,
	[ProcedureId.DrawFocusEffect]: drawFocusEffectProc,
	[ProcedureId.EngageEffect]: engageEffectProc,
	[ProcedureId.ExhaustEffect]: exhaustEffectProc,
	[ProcedureId.GatherCluesEffect]: gatherCluesEffectProc,
	[ProcedureId.HealEffect]: healEffectProc,
	[ProcedureId.MoveEffect]: moveEffectProc
};
