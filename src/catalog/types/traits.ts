import type { LocalisedText } from '$lib/localisation';
import type { CatalogRecord } from '..';

// YAML record types

export interface TraitRecord extends CatalogRecord {
	title: LocalisedText;
	description: LocalisedText;
	requirements: Array<TraitRequirementRecord>;
}

export type TraitRequirementRecord = { trait: string } | { traitProperty: string; count: number };

// Over the wire JSON types

export interface TraitDTO {
	id: string;
	path: Array<string>;
	title: string;
	description?: string;
	requirements: Array<TraitRequirementDTO>;
}

export type TraitRequirementDTO = { trait: string } | { traitProperty: string; count: number };

// In-app types

export interface Trait {
	id: string;
	title: string;
	description?: string;
	requirements: Array<TraitRequirement>;
}

export type TraitRequirement = { trait: Trait } | { traitProperty: Property; count: number };

export type Property = { id: string; title: string };
