import type { Entity } from './models/entity';

export interface EntryMetadata {
	id: string;
	variantId: string;
	path: Array<string>;
	catalog: EntityCatalog;
}

const metadataCache = new WeakMap<object, EntryMetadata>();

export class EntityCatalog {
	private readonly entries: Record<string, Entity>;

	constructor(...entrySets: Array<Record<string, Entity>>) {
		this.entries = {};
		for (const entrySet of entrySets) {
			Object.entries(entrySet).forEach(([key, entry]) => {
				const id = getEntryIdFromFileName(key);
				const path = getEntryPathFromFileName(key);
				for (const variant of entry.variants) {
					const variantMetadata = {
						id,
						variantId: entry.variants.length > 1 ? `${id}-${variant.level}` : id,
						path: path,
						catalog: this
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
