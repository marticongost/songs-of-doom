import type { Constructor } from '$lib/modelling';
import type { Entity, EntityProps } from './entity';

export const upgradable = <E extends Entity, Props extends EntityProps<E>>(
	entityType: Constructor<E, Props>,
	levels: number,
	builder: (level: number) => Props
): E => {
	const variants: Array<E> = [];
	for (let level = 1; level <= levels; level++) {
		const props = builder(level);
		props.level = level;
		props.variants = variants;
		const entity = new entityType(props);
		variants.push(entity);
	}
	return variants[0];
};
