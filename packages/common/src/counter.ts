/**
 * Abstract base class providing read-only counter operations over a map of item counts.
 *
 * Accepts several initialisation forms:
 * - `undefined` — starts empty
 * - Another `BaseCounter` — copies its entries
 * - A `Map<T, number>` — uses the map directly
 * - An `IterableIterator<T>` — counts occurrences of each item
 * - A plain `Record<T, number>` (when `T extends PropertyKey`) — converts via `Object.entries`
 */
export abstract class BaseCounter<T> {
	protected itemCounts: Map<T, number>;

	constructor(
		counter:
			| BaseCounter<T>
			| Map<T, number>
			| (T extends PropertyKey ? Record<T, number> : never)
			| IterableIterator<T>
			| undefined = undefined
	) {
		if (counter === undefined) {
			this.itemCounts = new Map();
		} else if (counter instanceof BaseCounter) {
			this.itemCounts = new Map(counter.entries());
		} else if (counter instanceof Map) {
			this.itemCounts = new Map(counter);
		} else if (Symbol.iterator in Object(counter)) {
			this.itemCounts = new Map();
			for (const item of counter as IterableIterator<T>) {
				this.itemCounts.set(item, (this.itemCounts.get(item) ?? 0) + 1);
			}
		} else {
			this.itemCounts = new Map(Object.entries(counter) as [T, number][]);
		}
	}

	/** Returns the count for `item`, or `0` if it has never been added. */
	get(item: T): number {
		return this.itemCounts.get(item) ?? 0;
	}

	/** Returns `true` if `item` has an explicit entry (count may be 0 if set directly via a Map). */
	has(item: T): boolean {
		return this.itemCounts.has(item);
	}

	/** Iterates over `[item, count]` pairs, matching `Map.entries()` semantics. */
	entries(): IterableIterator<[T, number]> {
		return this.itemCounts.entries();
	}

	/** Iterates over all items that have an explicit entry. */
	keys(): IterableIterator<T> {
		return this.itemCounts.keys();
	}

	/** Determines whether the counter is empty (no counts different than 0). */
	isEmpty(): boolean {
		for (const count of this.itemCounts.values()) {
			if (count !== 0) {
				return false;
			}
		}
		return true;
	}

	/** Returns the total count of all items in the counter. */
	totalCount(): number {
		let total = 0;
		for (const count of this.itemCounts.values()) {
			total += count;
		}
		return total;
	}

	/**
	 * Returns items sorted from most to least frequent.
	 *
	 * @param limit - Maximum number of items to return. Defaults to `Infinity` (all items).
	 */
	mostCommon(limit = Infinity): T[] {
		return Array.from(this.itemCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit)
			.map(([item]) => item);
	}
}

/** An immutable snapshot of a {@link Counter}. Constructed from a `Counter` instance. */
export class ReadonlyCounter<T> extends BaseCounter<T> {
	constructor(counter?: Counter<T>) {
		super(counter ?? new Map<T, number>());
	}
}

/** A mutable counter that tracks how many times each item has been added. */
export class Counter<T> extends BaseCounter<T> {
	/**
	 * Increments the count for `item` by `count` (default `1`).
	 * Creates an entry if one does not yet exist.
	 */
	add(item: T, count: number = 1): void {
		const currentCount = this.itemCounts.get(item) ?? 0;
		this.itemCounts.set(item, currentCount + count);
	}

	/** Decrements the count for `item` by `count` (default `1`). Creates an entry
	 * if one does not yet exist, resulting in a negative count.
	 */
	remove(item: T, count: number = 1): void {
		this.add(item, -count);
	}

	/** Removes `item` from the counter entirely. */
	delete(item: T): void {
		this.itemCounts.delete(item);
	}

	/** Removes all entries from the counter. */
	clear(): void {
		this.itemCounts.clear();
	}

	/** Returns an immutable {@link Counter} snapshot of the current state. */
	readonly(): ReadonlyCounter<T> {
		return new ReadonlyCounter(this);
	}
}
