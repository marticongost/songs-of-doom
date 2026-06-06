// Engine core
export { Engine, type EngineSnapshot } from './core/engine';
export { CapabilityChoiceField, Field, type FieldProps } from './core/input';
export { instructions } from './core/instructions';
export { JournalEntry } from './core/journal';
export { ProcedureDefinition, type ProcedureState, type ProcedureStatus } from './core/procedure';
export { procedureDefinitions } from './core/procedureregistry';
export {
	CallStep,
	ComputeStep,
	DispatchStep,
	ForEachStep,
	InputStep,
	type CallStepProps,
	type ComputeStepProps,
	type DispatchStepProps,
	type ForEachBodyState,
	type ForEachStepProps,
	type InputStepProps
} from './core/steps';

// State
export {
	AttackResolution,
	MutableAttackResolution,
	ReadonlyAttackResolution
} from './state/attackresolution';
export { CapabilityResolution, MutableCapabilityResolution } from './state/capabilityresolution';
export { CardContainer, CardOptions } from './state/cardcontainer';
export {
	CardState,
	MutableCardState,
	ReadonlyCardState,
	type CapabilityRef,
	type CardParent
} from './state/cardstate';
export { chooseEnemyAction } from './state/enemyactions';
export { EntityState, MutableEntityState } from './state/entitystate';
export {
	GameState,
	MutableGameState,
	ReadonlyGameState,
	type GameContext,
	type GameStateProps
} from './state/gamestate';
export {
	isAllyId,
	isCardId,
	isCreatureId,
	isLocationId,
	isObjectId,
	isPlayerId,
	isSkillId,
	isTraitId,
	type ActorId,
	type AllyId,
	type CardId,
	type CreatureId,
	type EntityId,
	type LocationId,
	type ObjectId,
	type PlayerId,
	type SkillId,
	type TraitId
} from './state/identifiers';
export {
	LocationState,
	MutableLocationState,
	ReadonlyLocationState,
	type LocationGraph
} from './state/locationstate';
export { mutate } from './state/mutate';
export { MutablePlayerState, PlayerState, ReadonlyPlayerState } from './state/playerstate';
export {
	MutableTestResolution,
	ReadonlyTestResolution,
	TestResolution
} from './state/testresolution';
export {
	MutableWoundResolution,
	ReadonlyWoundResolution,
	WoundResolution
} from './state/woundresolution';

// Expressions
export { evaluate } from './expressions';

// Sequence
export { runChapterEndPhase } from './sequence/chapterendphase';
export { runChapter } from './sequence/chapters';
export { runChapterStartPhase } from './sequence/chapterstartphase';
export { runDrawPhase } from './sequence/drawphase';
export { runEncounterPhase } from './sequence/encounterphase';
export { runFocusPhase } from './sequence/focusphase';
export { runCreatureActionsPhase } from './sequence/turncreatureactionsphase';
export { runTurnEndPhase } from './sequence/turnendphase';
export { runPlayerActionsPhase } from './sequence/turnplayeractionsphase';
export { runTurn, runTurnsPhase } from './sequence/turnsphase';
export { runTurnStartPhase } from './sequence/turnstartphase';

// Procedures
export { emitEvent, type EmitEventState, type EmitEventStepId } from './procedures/core/emitevent';
export {
	triggerCapability,
	type TriggerCapabilityState
} from './procedures/core/triggercapability';
