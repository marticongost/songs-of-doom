// Players
export type PlayerId = `plr${number}`;

// Cards
export type LocationId = `loc${number}`;
export type CreatureId = `crt${number}`;
export type AllyId = `aly${number}`;
export type ObjectId = `obj${number}`;
export type SkillId = `skl${number}`;
export type TraitId = `trt${number}`;
export type EncounterId = `enc${number}`;
export type StoryId = `sto${number}`;
export type ScenarioId = `scn${number}`;
export type CardId =
	| LocationId
	| CreatureId
	| AllyId
	| ObjectId
	| SkillId
	| TraitId
	| EncounterId
	| StoryId
	| ScenarioId;

// Any entity
export type EntityId = CardId | PlayerId;

export type ActorId = PlayerId | CreatureId | AllyId;

export const isCardId = (id: EntityId): id is CardId => !id.startsWith('plr');
export const isPlayerId = (id: EntityId): id is PlayerId => id.startsWith('plr');
export const isLocationId = (id: EntityId): id is LocationId => id.startsWith('loc');
export const isCreatureId = (id: EntityId): id is CreatureId => id.startsWith('crt');
export const isAllyId = (id: EntityId): id is AllyId => id.startsWith('aly');
export const isObjectId = (id: EntityId): id is ObjectId => id.startsWith('obj');
export const isSkillId = (id: EntityId): id is SkillId => id.startsWith('skl');
export const isTraitId = (id: EntityId): id is TraitId => id.startsWith('trt');
export const isEncounterId = (id: EntityId): id is EncounterId => id.startsWith('enc');
export const isStoryId = (id: EntityId): id is StoryId => id.startsWith('sto');
export const isScenarioId = (id: EntityId): id is ScenarioId => id.startsWith('scn');
