import { EntityCatalog } from '.';
import type { Ally } from './models/ally';
import type { Creature } from './models/creature';
import type { Encounter } from './models/encounter';
import type { Item } from './models/inventory';
import type { Module } from './models/module';
import type { Skill } from './models/skill';
import type { Trait } from './models/trait';

export const entities = new EntityCatalog(
	import.meta.glob<Trait | Skill>(`./data/archetypes/**/*.ts`, {
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
	})
);
