// Catalog infrastructure
export { entities, EntityCatalog, getEntryMetadata, type EntryMetadata } from './catalog';

// Core entity types
export { Ally } from './models/ally';
export { Archetype } from './models/archetype';
export { Campaign } from './models/campaign';
export { Creature } from './models/creature';
export { Discipline } from './models/discipline';
export { Encounter } from './models/encounter';
export { ChildEntity, Entity, ParentEntity } from './models/entity';
export { Event } from './models/event';
export { Module } from './models/module';
export { Scenario } from './models/scenario';
export { Story } from './models/story';
export { Skill } from './models/skill';
export { Talent, type TalentProps } from './models/talent';
export { Trait } from './models/trait';

// Inventory
export * from './models/inventory';

// Capabilities
export * from './models/capabilities';
export { Capability } from './models/capability';
export {
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
	type FocusesProps,
	type FocusType
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

// Results and Targets
export {
	parseResultString,
	resolveResultExpression,
	type CriticalFailure,
	type NumericResult,
	type Result,
	type ResultRange,
	type ResultSelector,
	type ResultSpec
} from './models/results';
export {
	Target,
	TargetDiscriminator,
	type TargetCardinality,
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

// Characters
export * from './models/characters';
