/**
 * Unique identifier for each type of procedure supported by the engine.
 *
 * Used to look up procedure definitions in {@link ProcedureRegistry}.
 */
export enum ProcedureId {
	Unimplemented = 'Unimplemented',

	// Core
	TriggerCapability = 'TriggerCapability',
	EmitEvent = 'EmitEvent',
	ResolveTarget = 'ResolveTarget',

	// Game sequence
	Chapter = 'Chapter',
	ChapterStartPhase = 'ChapterStartPhase',
	FocusPhase = 'FocusPhase',
	TurnsPhase = 'TurnsPhase',
	DrawPhase = 'DrawPhase',
	EncounterPhase = 'EncounterPhase',
	ChapterEndPhase = 'ChapterEndPhase',
	Turn = 'Turn',
	TurnStartPhase = 'TurnStartPhase',
	TurnPlayerActionsPhase = 'TurnPlayerActionsPhase',
	TurnCreatureActionsPhase = 'TurnCreatureActionsPhase',
	TurnEndPhase = 'TurnEndPhase',

	// Effects
	AttachEffect = 'AttachEffect',
	ConferPropertiesEffect = 'ConferPropertiesEffect',
	ConditionalEffect = 'ConditionalEffect',
	DiscardEffect = 'DiscardEffect',
	DiscardFromHandEffect = 'DiscardFromHandEffect',
	DrawCardsEffect = 'DrawCardsEffect',
	DrawFocusEffect = 'DrawFocusEffect',
	EngageEffect = 'EngageEffect'
}
