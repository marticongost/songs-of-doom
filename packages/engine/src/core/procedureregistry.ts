/* eslint-disable @typescript-eslint/no-explicit-any */
import { emitEvent } from '../procedures/core/emitevent';
import { triggerCapability } from '../procedures/core/triggercapability';
import { addChargesEffectProc } from '../procedures/effects/addchargesproc';
import { attachEffectProc } from '../procedures/effects/attachproc';
import { attackEffectProc } from '../procedures/effects/attackproc';
import { changeStatsEffectProc } from '../procedures/effects/changestatsproc';
import { chaseEffectProc } from '../procedures/effects/chaseproc';
import { conditionalEffectProc } from '../procedures/effects/conditionalproc';
import { conferPropertiesEffectProc } from '../procedures/effects/conferpropertiesproc';
import { defendEffectProc } from '../procedures/effects/defendproc';
import { discardFromHandEffectProc } from '../procedures/effects/discardfromhandproc';
import { discardEffectProc } from '../procedures/effects/discardproc';
import { drawCardsEffectProc } from '../procedures/effects/drawcardsproc';
import { drawFocusEffectProc } from '../procedures/effects/drawfocusproc';
import { engageEffectProc } from '../procedures/effects/engageproc';
import { equipEffectProc } from '../procedures/effects/equipproc';
import { exhaustEffectProc } from '../procedures/effects/exhaustproc';
import { gatherCluesEffectProc } from '../procedures/effects/gathercluesproc';
import { goTowardsEffectProc } from '../procedures/effects/gotowardsproc';
import { healEffectProc } from '../procedures/effects/healproc';
import { investigateEffectProc } from '../procedures/effects/investigateproc';
import { looseGoldEffectProc } from '../procedures/effects/loosegoldproc';
import { modifyCapabilityCostEffectProc } from '../procedures/effects/modifycapabilitycostproc';
import { modifyCarryingCapacityEffectProc } from '../procedures/effects/modifycarryingcapacityproc';
import { modifyConcentrationEffectProc } from '../procedures/effects/modifyconcentrationproc';
import { modifyDamageEffectProc } from '../procedures/effects/modifydamageproc';
import { modifyGatheredCluesEffectProc } from '../procedures/effects/modifygatheredcluesproc';
import { modifyRollEffectProc } from '../procedures/effects/modifyrollproc';
import { moveEffectProc } from '../procedures/effects/moveproc';
import { narrationEffectProc } from '../procedures/effects/narrationeffectproc';
import { negateDamageEffectProc } from '../procedures/effects/negatedamageproc';
import { oneOfEffectProc } from '../procedures/effects/oneofproc';
import { payEffectProc } from '../procedures/effects/payeffectproc';
import { playStoryCardsEffectProc } from '../procedures/effects/playstorycardsproc';
import { proficiencyTableEffectProc } from '../procedures/effects/proficiencytableproc';
import { receiveOpportunityAttacksEffectProc } from '../procedures/effects/receiveopportunityattacksproc';
import { recoverSanityEffectProc } from '../procedures/effects/recoversanityproc';
import { redrawFateEffectProc } from '../procedures/effects/redrawfateproc';
import { redrawFocusEffectProc } from '../procedures/effects/redrawfocusproc';
import { removeChargesEffectProc } from '../procedures/effects/removechargesproc';
import { repeatCapabilityEffectProc } from '../procedures/effects/repeatcapabilityproc';
import { replaceEncounterEffectProc } from '../procedures/effects/replaceencounterproc';
import { replacePropertyEffectProc } from '../procedures/effects/replacepropertyproc';
import { resolveEncounterEffectProc } from '../procedures/effects/resolveencounterproc';
import { resultsTableEffectProc } from '../procedures/effects/resultstableproc';
import { sanityLossEffectProc } from '../procedures/effects/sanitylossproc';
import { saveTargetToVariableEffectProc } from '../procedures/effects/savetargettovariableproc';
import { setRollResultEffectProc } from '../procedures/effects/setrollresultproc';
import { talentEffectProc } from '../procedures/effects/talenteffectproc';
import { testEffectProc } from '../procedures/effects/testeffectproc';
import { transformFocusEffectProc } from '../procedures/effects/transformfocusproc';
import { triggerActionEffectProc } from '../procedures/effects/triggeractionproc';
import { woundEffectProc } from '../procedures/effects/woundproc';
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
	[ProcedureId.AddChargesEffect]: addChargesEffectProc,
	[ProcedureId.AttackEffect]: attackEffectProc,
	[ProcedureId.AttachEffect]: attachEffectProc,
	[ProcedureId.ChangeStatsEffect]: changeStatsEffectProc,
	[ProcedureId.ChaseEffect]: chaseEffectProc,
	[ProcedureId.ConferPropertiesEffect]: conferPropertiesEffectProc,
	[ProcedureId.ConditionalEffect]: conditionalEffectProc,
	[ProcedureId.DefendEffect]: defendEffectProc,
	[ProcedureId.DiscardEffect]: discardEffectProc,
	[ProcedureId.DiscardFromHandEffect]: discardFromHandEffectProc,
	[ProcedureId.DrawCardsEffect]: drawCardsEffectProc,
	[ProcedureId.DrawFocusEffect]: drawFocusEffectProc,
	[ProcedureId.EngageEffect]: engageEffectProc,
	[ProcedureId.EquipEffect]: equipEffectProc,
	[ProcedureId.ExhaustEffect]: exhaustEffectProc,
	[ProcedureId.GatherCluesEffect]: gatherCluesEffectProc,
	[ProcedureId.GoTowardsEffect]: goTowardsEffectProc,
	[ProcedureId.HealEffect]: healEffectProc,
	[ProcedureId.InvestigateEffect]: investigateEffectProc,
	[ProcedureId.LooseGoldEffect]: looseGoldEffectProc,
	[ProcedureId.ModifyCapabilityCostEffect]: modifyCapabilityCostEffectProc,
	[ProcedureId.ModifyCarryingCapacityEffect]: modifyCarryingCapacityEffectProc,
	[ProcedureId.ModifyConcentrationEffect]: modifyConcentrationEffectProc,
	[ProcedureId.ModifyDamageEffect]: modifyDamageEffectProc,
	[ProcedureId.ModifyGatheredCluesEffect]: modifyGatheredCluesEffectProc,
	[ProcedureId.ModifyRollEffect]: modifyRollEffectProc,
	[ProcedureId.MoveEffect]: moveEffectProc,
	[ProcedureId.NarrationEffect]: narrationEffectProc,
	[ProcedureId.NegateDamageEffect]: negateDamageEffectProc,
	[ProcedureId.OneOfEffect]: oneOfEffectProc,
	[ProcedureId.PayEffect]: payEffectProc,
	[ProcedureId.PlayStoryCardsEffect]: playStoryCardsEffectProc,
	[ProcedureId.ProficiencyTableEffect]: proficiencyTableEffectProc,
	[ProcedureId.ReceiveOpportunityAttacksEffect]: receiveOpportunityAttacksEffectProc,
	[ProcedureId.RecoverSanityEffect]: recoverSanityEffectProc,
	[ProcedureId.RedrawFateEffect]: redrawFateEffectProc,
	[ProcedureId.RedrawFocusEffect]: redrawFocusEffectProc,
	[ProcedureId.RemoveChargesEffect]: removeChargesEffectProc,
	[ProcedureId.RepeatCapabilityEffect]: repeatCapabilityEffectProc,
	[ProcedureId.ReplaceEncounterEffect]: replaceEncounterEffectProc,
	[ProcedureId.ReplacePropertyEffect]: replacePropertyEffectProc,
	[ProcedureId.ResolveEncounterEffect]: resolveEncounterEffectProc,
	[ProcedureId.ResultsTableEffect]: resultsTableEffectProc,
	[ProcedureId.SanityLossEffect]: sanityLossEffectProc,
	[ProcedureId.SaveTargetToVariableEffect]: saveTargetToVariableEffectProc,
	[ProcedureId.SetRollResultEffect]: setRollResultEffectProc,
	[ProcedureId.TalentEffect]: talentEffectProc,
	[ProcedureId.TestEffect]: testEffectProc,
	[ProcedureId.TransformFocusEffect]: transformFocusEffectProc,
	[ProcedureId.TriggerActionEffect]: triggerActionEffectProc,
	[ProcedureId.WoundEffect]: woundEffectProc
};
