import { describe, expect, it } from 'vitest';
import { Counter, ReadonlyCounter } from './counter';

describe('Counter', () => {
	describe('construction', () => {
		it('starts empty when given no arguments', () => {
			const c = new Counter<string>();
			expect(c.get('a')).toBe(0);
			expect(c.has('a')).toBe(false);
		});

		it('copies entries from another Counter', () => {
			const source = new Counter<string>();
			source.add('a', 3);
			const copy = new Counter(source);
			expect(copy.get('a')).toBe(3);
		});

		it('initialises from a Map', () => {
			const c = new Counter(new Map([['x', 5]]));
			expect(c.get('x')).toBe(5);
		});

		it('counts occurrences from an iterator', () => {
			const items = ['a', 'b', 'a', 'c', 'a', 'b'][Symbol.iterator]();
			const c = new Counter(items);
			expect(c.get('a')).toBe(3);
			expect(c.get('b')).toBe(2);
			expect(c.get('c')).toBe(1);
		});

		it('initialises from a plain record', () => {
			const c = new Counter({ foo: 2, bar: 7 } as Record<string, number>);
			expect(c.get('foo')).toBe(2);
			expect(c.get('bar')).toBe(7);
		});
	});

	describe('add', () => {
		it('increments by 1 by default', () => {
			const c = new Counter<string>();
			c.add('a');
			c.add('a');
			expect(c.get('a')).toBe(2);
		});

		it('increments by the specified amount', () => {
			const c = new Counter<string>();
			c.add('a', 5);
			expect(c.get('a')).toBe(5);
		});

		it('creates the entry if it did not exist', () => {
			const c = new Counter<string>();
			c.add('new');
			expect(c.has('new')).toBe(true);
		});

		it('adds to a pre-initialised counter', () => {
			const c = new Counter(new Map([['a', 10]]));
			c.add('a', 3);
			expect(c.get('a')).toBe(13);
		});

		it('accumulates correctly across successive calls', () => {
			const c = new Counter<string>();
			c.add('a', 1);
			c.add('a', 2);
			c.add('a', 3);
			expect(c.get('a')).toBe(6);
		});

		it('decrements when given a negative value', () => {
			const c = new Counter<string>();
			c.add('a', 5);
			c.add('a', -2);
			expect(c.get('a')).toBe(3);
		});
	});

	describe('remove', () => {
		it.each([
			{ label: 'by 1 by default', count: undefined, expected: 4 },
			{ label: 'by the specified amount', count: 3, expected: 2 }
		])('decrements $label', ({ count, expected }) => {
			const c = new Counter<string>();
			c.add('a', 5);

			if (count === undefined) {
				c.remove('a');
			} else {
				c.remove('a', count);
			}

			expect(c.get('a')).toBe(expected);
		});

		it('creates a negative entry when removing an unknown item', () => {
			const c = new Counter<string>();
			c.remove('missing', 2);
			expect(c.has('missing')).toBe(true);
			expect(c.get('missing')).toBe(-2);
		});
	});

	describe('get', () => {
		it('returns 0 for unknown items', () => {
			const c = new Counter<string>();
			expect(c.get('missing')).toBe(0);
		});
	});

	describe('has', () => {
		it('returns false for unknown items', () => {
			const c = new Counter<string>();
			expect(c.has('missing')).toBe(false);
		});

		it('returns true for known items', () => {
			const c = new Counter<string>();
			c.add('present');
			expect(c.has('present')).toBe(true);
		});
	});

	describe('isEmpty', () => {
		it('returns true for a new counter', () => {
			const c = new Counter<string>();
			expect(c.isEmpty()).toBe(true);
		});

		it('returns true when all explicit entries are zero', () => {
			const c = new Counter(
				new Map([
					['a', 0],
					['b', 0]
				])
			);
			expect(c.isEmpty()).toBe(true);
		});

		it('returns false when any entry is > 0', () => {
			const c = new Counter(
				new Map([
					['a', 0],
					['b', 2]
				])
			);
			expect(c.isEmpty()).toBe(false);
		});

		it('returns false when any entry is < 0', () => {
			const c = new Counter(
				new Map([
					['a', 0],
					['b', -2]
				])
			);
			expect(c.isEmpty()).toBe(false);
		});

		it('returns true again when a count is brought back to zero', () => {
			const c = new Counter<string>();
			c.add('a', 3);
			c.add('a', -3);
			expect(c.isEmpty()).toBe(true);
		});
	});

	describe('totalCount', () => {
		it('returns 0 for an empty counter', () => {
			const c = new Counter<string>();
			expect(c.totalCount()).toBe(0);
		});

		it('returns the sum of all counts including negatives', () => {
			const c = new Counter<string>();
			c.add('a', 5);
			c.add('b', 2);
			c.remove('a', 1);
			c.remove('c', 3);
			expect(c.totalCount()).toBe(3);
		});
	});

	describe('delete', () => {
		it('removes an entry entirely', () => {
			const c = new Counter<string>();
			c.add('a', 3);
			c.delete('a');
			expect(c.has('a')).toBe(false);
			expect(c.get('a')).toBe(0);
		});

		it('is a no-op for unknown items', () => {
			const c = new Counter<string>();
			c.delete('missing');
			expect(c.has('missing')).toBe(false);
		});
	});

	describe('clear', () => {
		it('removes all entries', () => {
			const c = new Counter<string>();
			c.add('a', 2);
			c.add('b', 3);
			c.clear();
			expect(c.has('a')).toBe(false);
			expect(c.has('b')).toBe(false);
		});
	});

	describe('entries / keys', () => {
		it('iterates over all entries', () => {
			const c = new Counter<string>();
			c.add('a', 1);
			c.add('b', 2);
			expect([...c.entries()]).toEqual(
				expect.arrayContaining([
					['a', 1],
					['b', 2]
				])
			);
		});

		it('iterates over all keys', () => {
			const c = new Counter<string>();
			c.add('x');
			c.add('y');
			expect([...c.keys()]).toEqual(expect.arrayContaining(['x', 'y']));
		});
	});

	describe('mostCommon', () => {
		it('returns all items sorted by frequency descending', () => {
			const c = new Counter<string>();
			c.add('rare', 1);
			c.add('common', 5);
			c.add('mid', 3);
			expect(c.mostCommon()).toEqual(['common', 'mid', 'rare']);
		});

		it('limits results to the given number', () => {
			const c = new Counter<string>();
			c.add('a', 3);
			c.add('b', 2);
			c.add('c', 1);
			expect(c.mostCommon(2)).toEqual(['a', 'b']);
		});

		it('returns an empty array for an empty counter', () => {
			const c = new Counter<string>();
			expect(c.mostCommon()).toEqual([]);
		});
	});

	describe('readonly', () => {
		it('returns a ReadonlyCounter with the same entries', () => {
			const c = new Counter<string>();
			c.add('a', 4);
			const ro = c.readonly();
			expect(ro).toBeInstanceOf(ReadonlyCounter);
			expect(ro.get('a')).toBe(4);
		});

		it('snapshot is independent from subsequent mutations', () => {
			const c = new Counter<string>();
			c.add('a', 1);
			const ro = c.readonly();
			c.add('a', 10);
			expect(ro.get('a')).toBe(1);
		});
	});
});

describe('ReadonlyCounter', () => {
	it('starts empty when constructed without arguments', () => {
		const ro = new ReadonlyCounter<string>();
		expect(ro.get('x')).toBe(0);
	});

	it('copies entries from a Counter', () => {
		const c = new Counter<string>();
		c.add('z', 7);
		const ro = new ReadonlyCounter(c);
		expect(ro.get('z')).toBe(7);
	});
});
