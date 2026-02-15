// Catalog infrastructure
export { EntityCatalog, getEntryMetadata, entities, type EntryMetadata } from './catalog';

// Core entity types
export { Entity, ParentEntity, ChildEntity } from './models/entity';
export { Archetype } from './models/archetype';
export { Trait } from './models/trait';
export { Skill } from './models/skill';
export { Ally } from './models/ally';
export { Creature } from './models/creature';
export { Module } from './models/module';
export { Encounter } from './models/encounter';
export { Event } from './models/event';

// Inventory
export * from './models/inventory';

// Capabilities
export { Capability } from './models/capability';
export {
	CapabilityCost,
	type CapabilityCostType,
	type ScalarCapabilityCostType,
	type CardTransitionType,
	CardTransition,
	cardTransitions,
	cardTransitionTypes,
	scalarCapabilityCostTypes,
	capabilityCostTypes
} from './models/capabilitycost';
export * from './models/capabilities';

// Effects
export * from './models/effects';

// Expressions
export * from './models/expressions';

// Properties
export * from './models/properties';

// Stats and Focus
export {
	Stat,
	Attribute,
	Indicator,
	stats,
	attributes,
	indicators,
	attributeTypes,
	indicatorTypes,
	statTypes,
	strength,
	agility,
	intelligence,
	charisma,
	will,
	health,
	sanity,
	type AttributeType,
	type IndicatorType,
	type StatType
} from './models/stats';
export {
	Focus,
	Focuses,
	focuses,
	focusTypes,
	type FocusType,
	type FocusesProps
} from './models/focus';

// Results and Targets
export {
	type Result,
	type NumericResult,
	type CriticalFailure,
	type ResultSelector,
	type ResultSpec,
	type ResultRange,
	parseResultString,
	resolveResultExpression
} from './models/results';
export {
	Target,
	TargetDiscriminator,
	type TargetType,
	type TargetCardinality,
	type TargetSelection,
	type TargetSpec,
	type TargetProps,
	type TargetDiscriminatorProps,
	type TargetDiscriminatorSpec
} from './models/target';

// Common capability utilities
export {
	fullyRechargeOnChapterStart,
	shootBeforeEngaged,
	attachOrReplaceWithNewEncounterWhenRevealed
} from './models/common';

// Upgrades
export { upgradable, VariantMatcher, type LevelExpr } from './models/upgrades';

// Property data (instances of Rule, ScalarRule, etc.)
export * as propertyData from './data/properties';
