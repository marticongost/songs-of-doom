import { setEntryMetadata } from './entry-metadata';
import type { Entity } from './models/entities';
export { getEntryMetadata } from './entry-metadata';
export type { EntryMetadata } from './entry-metadata';

export class QualifiedEntries {
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
					const variantMetadata = {
						id,
						variantId: entry.variants.length > 1 ? `${id}-${variant.level}` : id,
						path: path,
						catalog: this,
						qualifiedPaths: qualifyIds
					};
					setEntryMetadata(variant as object, variantMetadata);
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
