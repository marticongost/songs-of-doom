import type { Trait } from './models/trait';

export interface EntryMetadata<T = unknown> {
	id: string;
	path: Array<string>;
	catalog: Catalog<T>;
}

const metadataCache = new WeakMap<object, EntryMetadata>();

export class Catalog<T> {
	private readonly entries: Record<string, T>;

	constructor(entries: Record<string, T>) {
		this.entries = {};
		Object.entries(entries).forEach(([key, entry]) => {
			const metadata = {
				id: getEntryIdFromFileName(key),
				path: getEntryPathFromFileName(key),
				catalog: this
			};
			metadataCache.set(entry as object, metadata);
			this.entries[metadata.id] = entry;
		});
	}

	require(id: string): T {
		const entry = this.entries[id];
		if (!entry) {
			throw new Error(`Catalog entry '${id}' not found`);
		}
		return entry;
	}

	get(id: string): T | undefined {
		return this.entries[id];
	}

	has(id: string): boolean {
		return id in this.entries;
	}

	all(): Array<T> {
		return Object.values(this.entries);
	}
}

export class TraitsCatalog extends Catalog<Trait> {
	rootTraits(): Array<Trait> {
		return this.all().filter((trait) => trait.isRootTrait());
	}
}

export const getEntryMetadata = <T>(entry: T): EntryMetadata<T> => {
	const metadata = metadataCache.get(entry as object);
	if (!metadata) {
		throw new Error('No metadata found for the given entry');
	}
	return metadata as EntryMetadata<T>;
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

export const traits = new TraitsCatalog(
	import.meta.glob<Trait>(`./data/traits/**/*.ts`, {
		eager: true,
		import: 'default'
	})
);
