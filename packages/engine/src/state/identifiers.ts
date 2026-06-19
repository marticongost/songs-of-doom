export const PLAYER = `plr`;
export const LOCATION = `loc`;
export const CREATURE = `crt`;
export const ALLY = `aly`;
export const ITEM = `itm`;
export const ARCHETYPE = `arc`;
export const SKILL = `skl`;
export const TRAIT = `trt`;
export const ENCOUNTER = `enc`;
export const STORY = `sto`;
export const SCENARIO = `scn`;

export type PlayerId = `${typeof PLAYER}${number}`;
export type LocationId = `${typeof LOCATION}${number}`;
export type CreatureId = `${typeof CREATURE}${number}`;
export type AllyId = `${typeof ALLY}${number}`;
export type ObjectId = `${typeof ITEM}${number}`;
export type SkillId = `${typeof SKILL}${number}`;
export type ArchetypeId = `${typeof ARCHETYPE}${number}`;
export type TraitId = `${typeof TRAIT}${number}`;
export type EncounterId = `${typeof ENCOUNTER}${number}`;
export type StoryId = `${typeof STORY}${number}`;
export type ScenarioId = `${typeof SCENARIO}${number}`;

export type CardId =
	| LocationId
	| CreatureId
	| AllyId
	| ObjectId
	| SkillId
	| ArchetypeId
	| TraitId
	| EncounterId
	| StoryId
	| ScenarioId;

// Any entity
export type EntityId = CardId | PlayerId;

export type ActorId = PlayerId | CreatureId | AllyId;

export const isCardId = (id: EntityId): id is CardId => !id.startsWith(PLAYER);
export const isPlayerId = (id: EntityId): id is PlayerId => id.startsWith(PLAYER);
export const isLocationId = (id: EntityId): id is LocationId => id.startsWith(LOCATION);
export const isCreatureId = (id: EntityId): id is CreatureId => id.startsWith(CREATURE);
export const isAllyId = (id: EntityId): id is AllyId => id.startsWith(ALLY);
export const isObjectId = (id: EntityId): id is ObjectId => id.startsWith(ITEM);
export const isSkillId = (id: EntityId): id is SkillId => id.startsWith(SKILL);
export const isTraitId = (id: EntityId): id is TraitId => id.startsWith(TRAIT);
export const isArchetypeId = (id: EntityId): id is ArchetypeId => id.startsWith(ARCHETYPE);
export const isEncounterId = (id: EntityId): id is EncounterId => id.startsWith(ENCOUNTER);
export const isStoryId = (id: EntityId): id is StoryId => id.startsWith(STORY);
export const isScenarioId = (id: EntityId): id is ScenarioId => id.startsWith(SCENARIO);
export const isActorId = (id: EntityId): id is ActorId =>
	isPlayerId(id) || isCreatureId(id) || isAllyId(id);
