import type { Creature } from './models/creature';
import type { Item } from './models/inventory';
import type { Skill } from './models/skill';
import type { Trait } from './models/trait';
import { Entity } from './models/entity';
import { Catalog } from '.';

export const entities = new Catalog<Entity>(
	import.meta.glob<Trait | Skill>(`./data/archetypes/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Item>(`./data/items/**/*.ts`, {
		eager: true,
		import: 'default'
	}),
	import.meta.glob<Creature>(`./data/creatures/**/*.ts`, {
		eager: true,
		import: 'default'
	})
);
