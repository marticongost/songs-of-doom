import { describe, expect, it } from 'vitest';
import { extensionMethod } from './extensionmethod';

describe('extensionMethod', () => {
	describe('basic usage', () => {
		it('calls the registered implementation on an object', () => {
			const greet = extensionMethod<string, string>();

			class Person {
				constructor(public name: string) {}
			}

			greet.implementFor(Person, (person: Person, greeting: string) => {
				return `${greeting}, ${person.name}!`;
			});

			const person = new Person('Alice');
			expect(greet(person, 'Hello')).toBe('Hello, Alice!');
		});

		it('supports different implementations for different types', () => {
			const describe = extensionMethod<void, string>();

			class Cat {}
			class Dog {}

			describe.implementFor(Cat, () => {
				return 'This is a cat';
			});
			describe.implementFor(Dog, () => {
				return 'This is a dog';
			});

			expect(describe(new Cat(), undefined as void)).toBe('This is a cat');
			expect(describe(new Dog(), undefined as void)).toBe('This is a dog');
		});

		it('passes the input argument to the implementation', () => {
			const multiply = extensionMethod<number, number>();

			class Value {
				constructor(public n: number) {}
			}

			multiply.implementFor(Value, (value: Value, factor: number) => {
				return value.n * factor;
			});

			expect(multiply(new Value(7), 3)).toBe(21);
		});

		it('works with zero-argument extensions by using void input', () => {
			const tag = extensionMethod<void, string>();

			class Widget {
				constructor(public id: number) {}
			}

			tag.implementFor(Widget, (widget: Widget) => {
				return `widget-${widget.id}`;
			});

			expect(tag(new Widget(42), undefined as void)).toBe('widget-42');
		});

		it('works with complex input and output types', () => {
			interface Options {
				prefix: string;
				suffix: string;
			}

			const format = extensionMethod<Options, string>();

			class Entry {
				constructor(public value: string) {}
			}

			format.implementFor(Entry, (entry: Entry, opts: Options) => {
				return `${opts.prefix}${entry.value}${opts.suffix}`;
			});

			expect(format(new Entry('test'), { prefix: '[', suffix: ']' })).toBe('[test]');
		});
	});

	describe('prototype chain', () => {
		it('walks the prototype chain to find an implementation', () => {
			const describe = extensionMethod<void, string>();

			class Animal {}
			class Dog extends Animal {}

			describe.implementFor(Animal, () => {
				return 'animal';
			});

			// Dog has no direct implementation, should fall back to Animal
			expect(describe(new Dog(), undefined as void)).toBe('animal');
		});

		it('prefers the most specific implementation (own constructor first)', () => {
			const describe = extensionMethod<void, string>();

			class Animal {}
			class Dog extends Animal {}

			describe.implementFor(Animal, () => {
				return 'animal';
			});
			describe.implementFor(Dog, () => {
				return 'dog';
			});

			expect(describe(new Dog(), undefined as void)).toBe('dog');
			expect(describe(new Animal(), undefined as void)).toBe('animal');
		});

		it('walks multiple levels of inheritance', () => {
			const describe = extensionMethod<void, string>();

			class LivingBeing {}
			class Animal extends LivingBeing {}
			class Dog extends Animal {}

			describe.implementFor(LivingBeing, () => {
				return 'living being';
			});

			expect(describe(new Dog(), undefined as void)).toBe('living being');
		});

		it('still walks past a constructor with no implementation', () => {
			const describe = extensionMethod<void, string>();

			class LivingBeing {}
			class Animal extends LivingBeing {}

			// Only the root has an implementation
			describe.implementFor(LivingBeing, () => {
				return 'living being';
			});

			expect(describe(new Animal(), undefined as void)).toBe('living being');
		});
	});

	describe('error handling', () => {
		it('throws when called on a non-object primitive', () => {
			const fn = extensionMethod<void, string>();

			expect(() => fn(42 as unknown as object, undefined as void)).toThrow(
				'Extension methods can only be called on objects'
			);
			expect(() => fn('string' as unknown as object, undefined as void)).toThrow(
				'Extension methods can only be called on objects'
			);
			expect(() => fn(true as unknown as object, undefined as void)).toThrow(
				'Extension methods can only be called on objects'
			);
		});

		it('throws when called on null', () => {
			const fn = extensionMethod<void, string>();

			// null has typeof 'object' but is not a valid object, so it should throw.
			expect(() => fn(null as unknown as object, undefined as void)).toThrow(
				'Extension methods can only be called on objects'
			);
		});

		it('throws when no implementation is found', () => {
			const fn = extensionMethod<void, string>();

			class Unrelated {}

			expect(() => fn(new Unrelated(), undefined as void)).toThrow(
				'No implementation found for the given input'
			);
		});

		it('throws for plain objects with no registered implementation', () => {
			const fn = extensionMethod<void, string>();

			expect(() => fn({}, undefined as void)).toThrow(
				'No implementation found for the given input'
			);
		});
	});

	describe('edge cases', () => {
		it('each extensionMethod instance has its own implementation registry', () => {
			const fn1 = extensionMethod<void, string>();
			const fn2 = extensionMethod<void, string>();

			class A {}

			fn1.implementFor(A, () => 'from fn1');
			fn2.implementFor(A, () => 'from fn2');

			expect(fn1(new A(), undefined as void)).toBe('from fn1');
			expect(fn2(new A(), undefined as void)).toBe('from fn2');
		});

		it('does not leak implementations between extensionMethod instances', () => {
			const fn1 = extensionMethod<void, string>();
			const fn2 = extensionMethod<void, string>();

			class A {}

			fn1.implementFor(A, () => 'from fn1');

			// fn2 should not see fn1's implementation
			expect(() => fn2(new A(), undefined as void)).toThrow(
				'No implementation found for the given input'
			);
		});

		it('can override a previously registered implementation', () => {
			const fn = extensionMethod<void, string>();

			class A {}

			fn.implementFor(A, () => 'first');
			fn.implementFor(A, () => 'second');

			expect(fn(new A(), undefined as void)).toBe('second');
		});

		it('preserves `this` context correctly', () => {
			const fn = extensionMethod<void, { name: string; self: unknown }>();

			class Example {
				name = 'example';

				getSelf() {
					return this;
				}
			}

			fn.implementFor(Example, (ex: Example) => {
				return { name: ex.name, self: ex };
			});

			const ex = new Example();
			const result = fn(ex, undefined as void);

			expect(result.name).toBe('example');
			expect(result.self).toBe(ex);
		});

		it('preserves `this` context through parent class implementations', () => {
			const fn = extensionMethod<void, { name: string; self: unknown }>();

			class Base {
				constructor(public name: string) {}
			}
			class Child extends Base {
				constructor(
					name: string,
					public extra: string
				) {
					super(name);
				}
			}

			// Register implementation on parent
			fn.implementFor(Base, (obj: Base) => {
				return { name: obj.name, self: obj };
			});

			// Child instance should still have correct `this` context
			const child = new Child('test', 'extra');
			const result = fn(child, undefined as void);

			expect(result.name).toBe('test');
			expect(result.self).toBe(child);
		});
	});
});
