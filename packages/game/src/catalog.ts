export * from './catalog-core';
import { EntityCatalog, QualifiedEntries } from './catalog-core';
import type {
	Ally,
	Campaign,
	Creature,
	Encounter,
	Entity,
	Item,
	Location,
	Module,
	Scenario,
	Skill,
	Story,
	Trait
} from './models/entities';

// Create the entities catalog with all game data
export const entities = new EntityCatalog(
	import.meta.glob<Trait | Skill>(`./data/archetypes/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Entity>(`./data/disciplines/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Ally>(`./data/allies/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Item>(`./data/items/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Module | Encounter | Creature>(`./data/modules/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	new QualifiedEntries(
		import.meta.glob<Campaign | Scenario | Story | Encounter | Location>(
			`./data/campaigns/**/*.ts`,
			{
				eager: true,
				import: 'default'
			}
		)
	)
);
