import type { ReadonlyCounter } from '@songsofdoom/common';
import type { FocusToken, FocusType } from '../focus';
import type { Target } from '../target';

export interface FieldProps<N extends string = string> {
	name: N;
}

export abstract class Field<T, N extends string = string> {
	declare protected _value: T;
	readonly name: N;

	constructor({ name }: FieldProps<N>) {
		this.name = name;
	}
}

export interface TargetFieldProps<N extends string = string> extends FieldProps<N> {
	target: Target;
}

export class TargetField<N extends string = string> extends Field<number[], N> {
	readonly target: Target;

	constructor({ target, ...baseProps }: TargetFieldProps<N>) {
		super(baseProps);
		this.target = target;
	}
}

export interface FocusesFieldProps<N extends string = string> extends FieldProps<N> {
	focuses: Partial<Record<FocusType, [number, number]>>;
}

export class FocusesField<N extends string = string> extends Field<ReadonlyCounter<FocusToken>, N> {
	readonly focuses: Partial<Record<FocusType, [number, number]>>;

	constructor({ focuses, ...baseProps }: FocusesFieldProps<N>) {
		super(baseProps);
		this.focuses = focuses;
	}
}

export class BooleanField<N extends string = string> extends Field<boolean, N> {}
