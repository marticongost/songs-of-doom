import type { Entity } from './models/entity';
import type { Ally } from './models/ally';
import type { Campaign } from './models/campaign';
import type { Creature } from './models/creature';
import type { Encounter } from './models/encounter';
import type { Item } from './models/inventory';
import type { Mission } from './models/mission';
import type { Module } from './models/module';
import type { Scenario } from './models/scenario';
import type { Skill } from './models/skill';
import type { Threat } from './models/threat';
import type { Trait } from './models/trait';

export interface EntryMetadata {
	id: string;
	variantId: string;
	path: Array<string>;
	catalog: EntityCatalog;
	/**
	 * Whether this entry uses path-qualified IDs (all path segments joined with `-`).
	 * Used by child entities to resolve their parent's ID correctly.
	 */
	qualifiedPaths: boolean;
}

const metadataCache = new WeakMap<object, EntryMetadata>();

class QualifiedEntries {
	constructor(
		readonly entries: Record<string, Entity>,
		readonly qualifyIds: boolean = true
	) {}
}

type EntrySetInput = Record<string, Entity> | QualifiedEntries;

export class EntityCatalog {
	private readonly entries: Record<string, Entity>;

	constructor(...entrySets: Array<EntrySetInput>) {
		this.entries = {};
		for (const entrySet of entrySets) {
			const qualifyIds = entrySet instanceof QualifiedEntries ? entrySet.qualifyIds : false;
			const rawEntries = entrySet instanceof QualifiedEntries ? entrySet.entries : entrySet;

			Object.entries(rawEntries).forEach(([key, entry]) => {
				const path = getEntryPathFromFileName(key);
				const id = qualifyIds ? getQualifiedId(path) : getEntryIdFromFileName(key);
				for (const variant of entry.variants) {
					const variantMetadata: EntryMetadata = {
						id,
						variantId: entry.variants.length > 1 ? `${id}-${variant.level}` : id,
						path: path,
						catalog: this,
						qualifiedPaths: qualifyIds
					};
					metadataCache.set(variant as object, variantMetadata);
					this.entries[variantMetadata.variantId] = variant;
				}
			});
		}
	}

	require(id: string): Entity {
		const entry = this.entries[id];
		if (!entry) {
			throw new Error(`Catalog entry '${id}' not found`);
		}
		return entry;
	}

	get(id: string): Entity | undefined {
		return this.entries[id];
	}

	has(id: string): boolean {
		return id in this.entries;
	}

	all(): Array<Entity> {
		return Object.values(this.entries);
	}
}

export const getEntryMetadata = (entry: Entity): EntryMetadata => {
	const metadata = metadataCache.get(entry as object);
	if (!metadata) {
		throw new Error(`No metadata found for entry '${entry.title.en}'`);
	}
	return metadata as EntryMetadata;
};

const getEntryIdFromFileName = (fileName: string): string => {
	const parts = fileName.split('/');
	const fileWithExtension = parts[parts.length - 1];
	return fileWithExtension.split('.')[0];
};

/**
 * Returns a path-qualified ID by joining all path segments with `-`.
 * When the file is "self-named" (filename equals its parent folder), the duplicate
 * trailing segment is collapsed — so `SoHH/sc1/sc1` becomes `SoHH-sc1`, not `SoHH-sc1-sc1`.
 */
const getQualifiedId = (path: string[]): string => {
	if (path.length >= 2 && path[path.length - 1] === path[path.length - 2]) {
		return path.slice(0, -1).join('-');
	}
	return path.join('-');
};

const getEntryPathFromFileName = (fileName: string): Array<string> => {
	if (fileName.startsWith('./')) {
		fileName = fileName.slice(2);
	}

	if (fileName.endsWith('index.ts')) {
		fileName = fileName.slice(0, -8);
	} else if (fileName.endsWith('.ts')) {
		fileName = fileName.slice(0, -3);
	}

	if (fileName.endsWith('/')) {
		fileName = fileName.slice(0, -1);
	}

	const parts = fileName.split('/');

	return parts.slice(2); // Remove the initial 'data' and category folder
};

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
		import.meta.glob<Campaign | Scenario | Threat | Mission | Encounter>(
			`./data/campaigns/**/*.ts`,
			{ eager: true, import: 'default' }
		)
	)
);
