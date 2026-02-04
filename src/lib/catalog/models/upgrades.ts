import type { Constructor } from '$lib/modelling';
import type { Entity, EntityProps } from './entity';

export const upgradable = <E extends Entity, Props extends EntityProps<E>>(
	entityType: Constructor<E, Props>,
	levels: number,
	builder: (level: VariantMatcher) => Props
): E => {
	const variants: Array<E> = [];
	for (let level = 1; level <= levels; level++) {
		const props = builder(new VariantMatcher(level));
		props.level = level;
		props.variants = variants;
		const entity = new entityType(props);
		variants.push(entity);
	}
	return variants[0];
};

export type LevelExpr = number | `${number}+` | `${number}-`;

export class VariantMatcher {
	readonly level: number;

	constructor(value: number) {
		this.level = value;
	}

	values<T>(...values: T[]): T {
		return values[this.level - 1];
	}

	matches(expr: LevelExpr): boolean {
		if (typeof expr === 'number') {
			return this.level === expr;
		} else if (expr.endsWith('+')) {
			const level = parseInt(expr.slice(0, -1), 10);
			return this.level >= level;
		} else if (expr.endsWith('-')) {
			const level = parseInt(expr.slice(0, -1), 10);
			return this.level <= level;
		}
		return false;
	}

	ifMatches<T>(expr: LevelExpr, ...items: T[]): T[] {
		return this.matches(expr) ? items : [];
	}
}
