// Catalog infrastructure
export { entities, EntityCatalog, getEntryMetadata, type EntryMetadata } from './catalog';

// Core entity types
export * from './models/entities';
export { Event, events, type EventType } from './models/event';
export { Talent, type TalentProps } from './models/talent';

// Slots
export * from './models/slots';

// Capabilities
export * from './models/capabilities';
export { EventTrigger } from './models/capabilities/reaction';
export { Capability } from './models/capability';
export {
	ActualCapabilityCost,
	CapabilityCost,
	capabilityCostTypes,
	CardTransition,
	cardTransitions,
	cardTransitionTypes,
	scalarCapabilityCostTypes,
	type CapabilityCostType,
	type CardTransitionType,
	type ScalarCapabilityCostType
} from './models/capabilitycost';

// Effects
export * from './models/effects';

// Expressions
export * from './models/expressions';

// Properties
export * from './models/properties';

// Stats and Focus
export {
	Focus,
	Focuses,
	focuses,
	focusTypes,
	getFocusTokenType,
	getFocusTokenValue,
	makeFocusToken,
	type FocusesProps,
	type FocusToken,
	type FocusType,
	type FocusValue
} from './models/focus';
export {
	agility,
	Attribute,
	attributes,
	attributeTypes,
	charisma,
	health,
	Indicator,
	indicators,
	indicatorTypes,
	intelligence,
	sanity,
	Stat,
	stats,
	statTypes,
	strength,
	will,
	type AttributeType,
	type IndicatorType,
	type StatType
} from './models/stats';

// Proficiency
export {
	parseProficiencyString,
	resolveProficiencySpec,
	type ProficiencyLevel,
	type ProficiencyRange,
	type ProficiencySelector,
	type ProficiencySpec,
	type ProficiencyString
} from './models/proficiency';

// Results and Targets
export {
	parseResultString,
	resolveResultExpression,
	sigils,
	type CriticalFailure,
	type NumericResult,
	type Result,
	type ResultRange,
	type ResultSelector,
	type ResultSpec,
	type Sigil
} from './models/results';
export {
	normaliseTargetCardinality,
	Target,
	TargetCardinality,
	TargetDiscriminator,
	type TargetCardinalityProps,
	type TargetCardinalitySpec,
	type TargetDiscriminatorProps,
	type TargetDiscriminatorSpec,
	type TargetProps,
	type TargetSelection,
	type TargetSpec,
	type TargetType
} from './models/target';

// Common capability utilities
export {
	attachOrReplaceWithNewEncounterWhenRevealed,
	fullyRechargeOnChapterStart,
	shootBeforeEngaged
} from './models/common';

// Upgrades
export { upgradable, VariantMatcher, type LevelExpr } from './models/upgrades';

// Property data (instances of Rule, ScalarRule, etc.)
export * as propertyData from './data/properties';

// Talent data
export * as talentData from './data/talents';

// Characters
export * from './models/characters';
