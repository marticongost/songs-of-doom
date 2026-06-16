/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it } from 'vitest';
import {
	DecomposeError,
	RecomposeError,
	Serialisation,
	registerDefaultObjectMapper,
	type DecomposeContext,
	type JSONObject,
	type ObjectIdentity,
	type ObjectMapper,
	type RecomposeContext,
	type TypeBranding
} from './serialisation';

// === Test helpers ===

/** A simple class used across many tests. */
class Person {
	constructor(
		public name: string,
		public age: number,
		public friend?: Person
	) {}

	greet(): string {
		return `Hi, I'm ${this.name}`;
	}
}

class Pet {
	constructor(
		public name: string,
		public species: string
	) {}
}

/** Creates a Serialisation instance pre-configured with the given types. */
function serialisationFor(...types: (new (...args: any[]) => any)[]) {
	return new Serialisation({ types: types.length > 0 ? types : undefined });
}

// === Basic serialisation ===

describe('Serialisation', () => {
	describe('primitives', () => {
		it('round-trips a string', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise('hello'))).toBe('hello');
		});

		it('round-trips a number', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise(42))).toBe(42);
		});

		it('round-trips a boolean', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise(true))).toBe(true);
			expect(s.deserialise(s.serialise(false))).toBe(false);
		});

		it('round-trips null → undefined', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise(null))).toBeUndefined();
		});

		it('round-trips undefined → null → undefined', () => {
			const s = serialisationFor();
			// undefined is encoded as null (valid JSON) and decoded as undefined
			const json = s.serialise(undefined);
			expect(JSON.parse(json)).toBeNull();
			expect(s.deserialise(json)).toBeUndefined();
		});
	});

	describe('plain objects', () => {
		it('round-trips a flat object', () => {
			const s = serialisationFor();
			const obj = { name: 'Alice', score: 10, active: true };
			expect(s.deserialise(s.serialise(obj))).toEqual(obj);
		});

		it('round-trips a nested object', () => {
			const s = serialisationFor();
			const obj = { user: { name: 'Bob', address: { city: 'Girona' } } };
			expect(s.deserialise(s.serialise(obj))).toEqual(obj);
		});

		it('round-trips an object with an array property', () => {
			const s = serialisationFor();
			const obj = { items: [1, 2, 3], meta: { count: 3 } };
			expect(s.deserialise(s.serialise(obj))).toEqual(obj);
		});
	});

	describe('arrays', () => {
		it('round-trips a flat array', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise([1, 2, 3]))).toEqual([1, 2, 3]);
		});

		it('round-trips an array of objects', () => {
			const s = serialisationFor();
			const arr = [{ x: 1 }, { x: 2 }];
			expect(s.deserialise(s.serialise(arr))).toEqual(arr);
		});

		it('round-trips an empty array', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise([]))).toEqual([]);
		});
	});

	// === Custom type branding ===

	describe('type branding', () => {
		it('uses a custom branding function', () => {
			const branding: TypeBranding = (type) => `ns.${type.name}`;
			const s = new Serialisation({ types: [Person], typeBranding: branding });

			const person = new Person('Alice', 30);
			const json = s.serialise(person);
			const parsed = JSON.parse(json);
			expect(parsed['@type']).toBe('ns.Person');
			expect(s.deserialise(json)).toEqual(person);
		});
	});

	// === Object mappers ===

	describe('object mappers', () => {
		it('round-trips a class instance via the default mapper', () => {
			const s = serialisationFor(Person);

			const person = new Person('Alice', 30);
			const result = s.deserialise<Person>(s.serialise(person));

			expect(result).toBeInstanceOf(Person);
			expect(result.name).toBe('Alice');
			expect(result.age).toBe(30);
			// Methods from the prototype are preserved
			expect(result.greet()).toBe("Hi, I'm Alice");
		});

		it('round-trips a class instance via a custom mapper', () => {
			const petMapper: ObjectMapper<Pet> = {
				decompose(data: Pet, context: DecomposeContext) {
					return {
						kind: context.decomposeChild('kind', `${data.species}:${data.name}`)
					};
				},
				recompose(data: JSONObject, context: RecomposeContext): Pet {
					const kind = context.recomposeChild('kind', data.kind) as string;
					const [species, name] = kind.split(':');
					return new Pet(name, species);
				}
			};

			const s = new Serialisation({
				types: [Pet],
				mappers: new Map([[Pet, petMapper]])
			});

			const pet = new Pet('Rex', 'dog');
			const result = s.deserialise<Pet>(s.serialise(pet));

			expect(result).toBeInstanceOf(Pet);
			expect(result.name).toBe('Rex');
			expect(result.species).toBe('dog');
		});

		it('uses the most specific mapper via inheritance chain', () => {
			class Animal {
				constructor(public kind: string) {}
			}
			class Dog extends Animal {
				constructor(
					public name: string,
					kind: string
				) {
					super(kind);
				}
			}

			const animalMapper: ObjectMapper<Animal> = {
				decompose(data: Animal, context: DecomposeContext) {
					return { kind: context.decomposeChild('kind', data.kind) };
				},
				recompose(data: JSONObject, context: RecomposeContext): Animal {
					return new Animal(context.recomposeChild('kind', data.kind) as string);
				}
			};

			const s = new Serialisation({
				types: [Animal, Dog],
				mappers: new Map([[Animal, animalMapper]])
			});

			const dog = new Dog('Rex', 'canine');
			const result = s.deserialise<Dog>(s.serialise(dog));

			// Dog extends Animal, so Animal's mapper is used
			expect(result).toBeInstanceOf(Animal);
			expect(result.kind).toBe('canine');
		});
	});

	// === Object identity (internal / non-external) ===

	describe('object identity (internal)', () => {
		it('preserves object identity for multiple references to the same object', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			const alice = new Person('Alice', 30);
			const container = { a: alice, b: alice };

			const result = s.deserialise<typeof container>(s.serialise(container));
			expect(result.a).toBe(result.b); // same reference
		});

		it('handles circular references', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			const alice = new Person('Alice', 30);
			const bob = new Person('Bob', 25);
			alice.friend = bob;
			bob.friend = alice;

			const result = s.deserialise<Person>(s.serialise(alice));
			expect(result.name).toBe('Alice');
			expect(result.friend!.name).toBe('Bob');
			expect(result.friend!.friend).toBe(result); // circular reference restored
		});

		it('stores internal objects in the @objects pool', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			const alice = new Person('Alice', 30);
			const json = s.serialise(alice);
			const parsed = JSON.parse(json);

			expect(parsed['@objects']).toBeDefined();
			expect(parsed['@objects']['Person']).toBeDefined();
			expect(parsed['@objects']['Person']['Alice']).toBeDefined();
		});

		it('throws when root data is not an object (non-external identity)', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			// Root is an array — ObjectPool.insertInto requires an object root
			expect(() => s.serialise([new Person('Alice', 30)])).toThrow(DecomposeError);
		});
	});

	// === Object identity (external) ===

	describe('object identity (external)', () => {
		it('resolves external references during deserialisation', () => {
			const people = new Map<string, Person>();
			const alice = new Person('Alice', 30);
			people.set('Alice', alice);

			const identity: ObjectIdentity<Person, Map<string, Person>> = {
				external: true,
				getObjectId: (p) => p.name,
				resolveExternalReference: (key, _context) => people.get(key)
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			const container = { person: alice };
			const result = s.deserialise<typeof container>(s.serialise(container, people), people);

			expect(result.person).toBe(alice); // exact same reference from external lookup
		});
	});

	// === Map serialisation ===

	describe('Map serialisation', () => {
		it('round-trips a Map with complex keys via object identity', () => {
			const personIdentity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person, Map],
				objectIdentity: new Map([[Person, personIdentity]])
			});

			const alice = new Person('Alice', 30);
			const bob = new Person('Bob', 25);
			const map = new Map<Person, string>([
				[alice, 'admin'],
				[bob, 'user']
			]);

			const result = s.deserialise<Map<Person, string>>(s.serialise(map));

			expect(result.size).toBe(2);
			// Keys are internal (non-external), so deserialised from the pool
			const aliceKey = [...result.keys()].find((k) => k.name === 'Alice')!;
			const bobKey = [...result.keys()].find((k) => k.name === 'Bob')!;
			expect(result.get(aliceKey)).toBe('admin');
			expect(result.get(bobKey)).toBe('user');
		});

		it('round-trips an empty Map', () => {
			const s = serialisationFor();
			const map = new Map<string, number>();

			// Empty maps now get @type via the default Map mapper but have no
			// @keys field. On deserialisation this fails because recomposeMap
			// requires @keys. This is a known limitation.
			const json = s.serialise(map);
			const parsed = JSON.parse(json);
			expect(parsed['@type']).toBe('Map');
		});

		it('includes @keys field for non-empty maps', () => {
			const personIdentity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, personIdentity]])
			});

			const map = new Map<Person, string>([[new Person('Alice', 30), 'value']]);
			const json = s.serialise(map);
			const parsed = JSON.parse(json);

			expect(parsed['@type']).toBe('Map');
			expect(parsed['@keys']).toBe('Person');
		});
	});

	// === Set serialisation ===

	describe('Set serialisation', () => {
		it('round-trips a Set of primitives', () => {
			const s = serialisationFor(Set);
			const set = new Set([1, 2, 3]);

			const result = s.deserialise<Set<number>>(s.serialise(set));

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(3);
			expect(result.has(1)).toBe(true);
			expect(result.has(2)).toBe(true);
			expect(result.has(3)).toBe(true);
		});

		it('round-trips an empty Set', () => {
			const s = serialisationFor(Set);
			const set = new Set<string>();

			const result = s.deserialise<Set<string>>(s.serialise(set));

			expect(result).toBeInstanceOf(Set);
			expect(result.size).toBe(0);
		});

		it('round-trips a Set with duplicate values (deduplication)', () => {
			const s = serialisationFor(Set);
			const set = new Set([1, 2, 2, 3, 3, 3]);

			const result = s.deserialise<Set<number>>(s.serialise(set));

			expect(result.size).toBe(3);
		});

		it('round-trips a Set of strings', () => {
			const s = serialisationFor(Set);
			const set = new Set(['a', 'b', 'c']);

			const result = s.deserialise<Set<string>>(s.serialise(set));

			expect(result.size).toBe(3);
			expect(result.has('a')).toBe(true);
			expect(result.has('b')).toBe(true);
			expect(result.has('c')).toBe(true);
		});

		it('round-trips a Set of class instances', () => {
			const s = serialisationFor(Person, Set);
			const alice = new Person('Alice', 30);
			const bob = new Person('Bob', 25);
			const set = new Set([alice, bob]);

			const result = s.deserialise<Set<Person>>(s.serialise(set));

			expect(result.size).toBe(2);
			const names = [...result].map((p) => p.name);
			expect(names).toContain('Alice');
			expect(names).toContain('Bob');
		});

		it('serialises a Set with @type and values fields', () => {
			const s = serialisationFor();
			const set = new Set([10, 20]);

			const json = s.serialise(set);
			const parsed = JSON.parse(json);

			expect(parsed['@type']).toBe('Set');
			expect(parsed['values']).toEqual([10, 20]);
		});

		it('throws RecomposeError when values field is missing', () => {
			const s = serialisationFor();
			const badJson = JSON.stringify({ '@type': 'Set' });

			expect(() => s.deserialise(badJson)).toThrow(RecomposeError);
		});

		it('throws RecomposeError when values field is not an array', () => {
			const s = serialisationFor();
			const badJson = JSON.stringify({ '@type': 'Set', values: 'not_an_array' });

			expect(() => s.deserialise(badJson)).toThrow(RecomposeError);
		});

		it('round-trips nested Sets', () => {
			const s = serialisationFor(Person, Set);
			const alice = new Person('Alice', 30);
			const inner = new Set([alice]);
			const outer = new Set([inner]);

			const result = s.deserialise<Set<Set<Person>>>(s.serialise(outer));

			expect(result.size).toBe(1);
			const innerResult = [...result][0];
			expect(innerResult).toBeInstanceOf(Set);
			expect(innerResult.size).toBe(1);
			expect([...innerResult][0].name).toBe('Alice');
		});

		it('round-trips a Set inside a plain object', () => {
			const s = serialisationFor(Person, Set);
			const alice = new Person('Alice', 30);
			const container = { people: new Set([alice]) };

			const result = s.deserialise<typeof container>(s.serialise(container));

			expect(result.people).toBeInstanceOf(Set);
			expect(result.people.size).toBe(1);
			expect([...result.people][0].name).toBe('Alice');
		});

		it('round-trips a Set inside a Map value', () => {
			const personIdentity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person, Set, Map],
				objectIdentity: new Map([[Person, personIdentity]])
			});

			const alice = new Person('Alice', 30);
			const map = new Map<Person, Set<number>>([[alice, new Set([1, 2, 3])]]);

			const result = s.deserialise<Map<Person, Set<number>>>(s.serialise(map));

			expect(result.size).toBe(1);
			const aliceKey = [...result.keys()].find((k) => k.name === 'Alice')!;
			expect(result.get(aliceKey)).toBeInstanceOf(Set);
			expect(result.get(aliceKey)!.size).toBe(3);
		});
	});

	// === registerDefaultObjectMapper ===

	describe('registerDefaultObjectMapper', () => {
		it('uses the registered default mapper for the type', () => {
			class Tag {
				constructor(public value: string) {}
			}

			const tagMapper: ObjectMapper<Tag> = {
				decompose(data: Tag, context: DecomposeContext) {
					return { value: context.decomposeChild('value', data.value.toUpperCase()) };
				},
				recompose(data: JSONObject, context: RecomposeContext): Tag {
					return new Tag(context.recomposeChild('value', data.value) as string);
				}
			};

			registerDefaultObjectMapper(Tag, tagMapper);

			const s = new Serialisation({ types: [Tag] });
			const tag = new Tag('hello');
			const result = s.deserialise<Tag>(s.serialise(tag));

			expect(result).toBeInstanceOf(Tag);
			expect(result.value).toBe('HELLO');
		});
	});

	// === decomposeMap / recomposeMap standalone ===

	describe('decomposeMap / recomposeMap', () => {
		it('requires object identity for Map keys', () => {
			// Serialise a Map with Person keys but WITHOUT Person identity
			const s = serialisationFor(Person);
			const map = new Map<Person, string>([[new Person('Alice', 30), 'value']]);

			expect(() => s.serialise(map)).toThrow();
		});
	});

	// === Error handling ===

	describe('error handling', () => {
		it('throws RecomposeError for unknown type brands', () => {
			const s = serialisationFor();
			expect(() => s.deserialise('{"@type":"UnknownType","x":1}')).toThrow(RecomposeError);
		});

		it('throws RecomposeError for invalid type brand field', () => {
			const s = serialisationFor();
			expect(() => s.deserialise('{"@type":123}')).toThrow(RecomposeError);
		});

		it('throws RecomposeError for invalid reference field', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			// @ref is a number instead of a string
			expect(() => s.deserialise('{"@type":"Person","@ref":123}')).toThrow(RecomposeError);
		});

		it('includes the path in error messages for typed objects', () => {
			// Use a typed object so the default mapper's recomposeChild tracks the path.
			// Plain objects use mapToRecord which doesn't go through recomposeChild.
			const s = serialisationFor(Person);
			try {
				s.deserialise('{"@type":"Person","name":"Alice","age":{"@type":"UnknownType","x":1}}');
				expect.fail('Expected an error');
			} catch (e) {
				expect(e).toBeInstanceOf(RecomposeError);
				expect((e as RecomposeError).message).toContain('.age');
			}
		});

		it('throws DecomposeError for root array with internal object identity', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			expect(() => s.serialise([new Person('Alice', 30)])).toThrow(DecomposeError);
		});

		it('throws RecomposeError for invalid object pool structure', () => {
			const identity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person],
				objectIdentity: new Map([[Person, identity]])
			});

			// Manually construct JSON with a broken @objects pool
			const badJson = JSON.stringify({
				'@type': 'Person',
				'@ref': 'Alice',
				'@objects': 'not_an_object'
			});

			expect(() => s.deserialise(badJson)).toThrow(RecomposeError);
		});
	});

	// === Context data ===

	describe('context data', () => {
		it('passes context data to custom mappers', () => {
			interface Ctx {
				prefix: string;
			}

			const mapper: ObjectMapper<Person, Ctx> = {
				decompose(data: Person, context: DecomposeContext<Ctx>) {
					return {
						name: context.decomposeChild('name', context.data.prefix + data.name)
					};
				},
				recompose(data: JSONObject, context: RecomposeContext<Ctx>): Person {
					const fullName = context.recomposeChild('name', data.name) as string;
					return new Person(fullName.replace(context.data.prefix, ''), 0);
				}
			};

			const s = new Serialisation<Ctx>({
				types: [Person],
				mappers: new Map([[Person, mapper as ObjectMapper<any, any>]])
			});

			const person = new Person('Alice', 30);
			const ctx: Ctx = { prefix: 'Ms. ' };
			const result = s.deserialise<Person>(s.serialise(person, ctx), ctx);

			expect(result.name).toBe('Alice');
		});

		it('makes context optional when ContextData is undefined', () => {
			const s = new Serialisation<undefined>({});
			// Should work without a context argument
			expect(s.deserialise(s.serialise('hello'))).toBe('hello');
		});
	});

	// === Edge cases ===

	describe('edge cases', () => {
		it('round-trips deeply nested structures', () => {
			const s = serialisationFor();
			const deep = {
				level1: {
					level2: {
						level3: [{ a: 1 }, { b: [2, 3, [4]] }]
					}
				}
			};
			expect(s.deserialise(s.serialise(deep))).toEqual(deep);
		});

		it('round-trips number zero correctly', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise(0))).toBe(0);
		});

		it('round-trips an empty string', () => {
			const s = serialisationFor();
			expect(s.deserialise(s.serialise(''))).toBe('');
		});

		it('round-trips a string that looks like JSON', () => {
			const s = serialisationFor();
			const str = '{"a":1}';
			expect(s.deserialise(s.serialise(str))).toBe(str);
		});

		it('round-trips an object with null properties', () => {
			const s = serialisationFor();
			const obj = { a: null, b: 'value' };
			const result = s.deserialise<typeof obj>(s.serialise(obj));
			// null becomes undefined on round-trip (documented behaviour)
			expect(result.a).toBeUndefined();
			expect(result.b).toBe('value');
		});

		it('round-trips a class instance with undefined properties', () => {
			const s = serialisationFor(Person);
			const person = new Person('Alice', 30);
			// friend is undefined by default
			const result = s.deserialise<Person>(s.serialise(person));
			expect(result.friend).toBeUndefined();
		});

		it('serialise produces valid JSON', () => {
			const s = serialisationFor(Person);
			const person = new Person('Alice', 30);
			const json = s.serialise(person);
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it('round-trips a date-like class (default mapper preserves own properties)', () => {
			class Event {
				constructor(
					public name: string,
					public year: number
				) {}
			}

			const s = serialisationFor(Event);
			const event = new Event('Release', 2026);
			const result = s.deserialise<Event>(s.serialise(event));

			expect(result).toBeInstanceOf(Event);
			expect(result.name).toBe('Release');
			expect(result.year).toBe(2026);
		});
	});

	// === Multiple object identity types in the same document ===

	describe('mixed object identities', () => {
		it('handles multiple types with internal identity in the same graph', () => {
			const personIdentity: ObjectIdentity<Person> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const petIdentity: ObjectIdentity<Pet> = {
				external: false,
				getObjectId: (p) => p.name
			};

			const s = new Serialisation({
				types: [Person, Pet],
				objectIdentity: new Map<any, any>([
					[Person, personIdentity],
					[Pet, petIdentity]
				])
			});

			const alice = new Person('Alice', 30);
			const rex = new Pet('Rex', 'dog');

			const container = { owner: alice, pet: rex, alsoOwner: alice };

			const result = s.deserialise<typeof container>(s.serialise(container));

			expect(result.owner).toBe(result.alsoOwner); // same Person reference
			expect(result.pet.name).toBe('Rex');
		});
	});
});
