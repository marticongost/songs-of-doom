import { ReadonlyCounter } from '@songsofdoom/common';
import type { ActualCapabilityCost, Payment } from '../capabilitycost';
import type { FocusToken } from '../focus';
import type { Result } from '../results';
import type { Target } from '../target';
import type { CapabilityRef } from './cardstate';

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
	focuses: ReadonlyCounter<FocusToken>;
	maxTotalTokens?: number;
}

export class FocusesField<N extends string = string, R extends boolean = true> extends Field<
	ReadonlyCounter<FocusToken>,
	N,
	R
> {
	readonly focuses: ReadonlyCounter<FocusToken>;
	readonly maxTotalTokens?: number;

	constructor({ focuses, maxTotalTokens, ...baseProps }: FocusesFieldProps<N, R>) {
		super(baseProps);
		this.focuses = focuses;
		this.maxTotalTokens = maxTotalTokens;
	}
}

export class BooleanField<N extends string = string, R extends boolean = true> extends Field<
	boolean,
	N,
	R
> {}

export interface CapabilityChoiceFieldProps<
	N extends string = string,
	R extends boolean = true
> extends FieldProps<N, R> {
	choices: Set<CapabilityRef>;
}

export class CapabilityChoiceField<
	N extends string = string,
	R extends boolean = true
> extends Field<CapabilityRef, N, R> {
	readonly choices: Set<CapabilityRef>;

	constructor({ choices, ...baseProps }: CapabilityChoiceFieldProps<N, R>) {
		super(baseProps);
		this.choices = choices;
	}
}

export class ResultField<N extends string = string, R extends boolean = true> extends Field<
	Result,
	N,
	R
> {}

/**
 * Constructor for {@link PaymentField}.
 */
export interface PaymentFieldProps<
	N extends string = string,
	R extends boolean = true
> extends FieldProps<N, R> {
	/** The cost to be paid. */
	cost: ActualCapabilityCost;
}

/**
 * A type of field that can be used to request a payment from the player. If there are
 * multiple ways to pay the cost, the player will be asked to choose how they want to
 * pay it.
 */
export class PaymentField<N extends string = string, R extends boolean = true> extends Field<
	Payment,
	N,
	R
> {
	/** The cost to be paid. */
	readonly cost: ActualCapabilityCost;

	constructor({ cost, ...baseProps }: PaymentFieldProps<N, R>) {
		super(baseProps);
		this.cost = cost;
	}
}
