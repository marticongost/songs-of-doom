import type { ReadonlyCounter } from '@songsofdoom/common';
import type { FocusToken, FocusType } from '../focus';
import type { Target } from '../target';

export interface FieldProps<N extends string = string, R extends boolean = true> {
	name: N;
	required?: R;
}

export abstract class Field<T, N extends string = string, R extends boolean = true> {
	declare protected _value: T;
	readonly name: N;
	readonly required: R;

	constructor({ name, required }: FieldProps<N, R>) {
		this.name = name;
		this.required = (required ?? true) as R;
	}
}

export interface TargetFieldProps<
	N extends string = string,
	R extends boolean = true
> extends FieldProps<N, R> {
	target: Target;
}

export class TargetField<N extends string = string, R extends boolean = true> extends Field<
	number[],
	N,
	R
> {
	readonly target: Target;

	constructor({ target, ...baseProps }: TargetFieldProps<N, R>) {
		super(baseProps);
		this.target = target;
	}
}

export interface FocusesFieldProps<
	N extends string = string,
	R extends boolean = true
> extends FieldProps<N, R> {
	focuses: Partial<Record<FocusType, [number, number]>>;
}

export class FocusesField<N extends string = string, R extends boolean = true> extends Field<
	ReadonlyCounter<FocusToken>,
	N,
	R
> {
	readonly focuses: Partial<Record<FocusType, [number, number]>>;

	constructor({ focuses, ...baseProps }: FocusesFieldProps<N, R>) {
		super(baseProps);
		this.focuses = focuses;
	}
}

export class BooleanField<N extends string = string, R extends boolean = true> extends Field<
	boolean,
	N,
	R
> {}
