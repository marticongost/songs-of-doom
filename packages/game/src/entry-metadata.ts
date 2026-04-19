import type { EntityCatalog } from './catalog-core';
import type { Entity } from './models/entities';

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

export const setEntryMetadata = (entry: object, metadata: EntryMetadata): void => {
	metadataCache.set(entry, metadata);
};

export const getEntryMetadata = (entry: Entity): EntryMetadata => {
	const metadata = metadataCache.get(entry as object);
	if (!metadata) {
		throw new Error(`No metadata found for entry '${entry.title.en}'`);
	}
	return metadata as EntryMetadata;
};
