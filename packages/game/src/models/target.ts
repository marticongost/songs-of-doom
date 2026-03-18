import { finalise } from '@songsofdoom/common';
import {
	ScalarExpression,
	type BooleanExpressionType,
	type ScalarExpressionType
} from './expressions';
import { Stat } from './stats';

/** A subset of {@link TargetType} that can be used to designate players. */
export type PlayerTargetType = 'player' | 'owner' | 'active-player';

/** A subset of {@link TargetType} that can be used to designate both characters or creatures. */
export type ActorTargetType = PlayerTargetType | 'attacker' | 'defender' | 'enemy' | 'ally';

/** A subset of {@link TargetType} that can be used to designate enemy creatures. */
export type EnemyTargetType = 'enemy';

/** A subset of {@link TargetType} that can be used to designate character allies. */
export type AllyTargetType = 'ally';

/** A subset of {@link TargetType} that can be used to designate objects. */
export type ObjectTargetType = 'object';

/** A subset of {@link TargetType} that can be used to designate locations. */
export type LocationTargetType = 'location';

/** A type of target for a game effect. */
export type TargetType =
	| PlayerTargetType
	| ActorTargetType
	| EnemyTargetType
	| AllyTargetType
	| ObjectTargetType
	| LocationTargetType;

/** A specification for a number of targets to select, supporting a variety of formats. */
export type TargetCardinalitySpec =
	| TargetCardinality
	| TargetCardinalityProps
	| ScalarExpressionType
	| `${number}+`
	| `${number}-${number}`
	| 'every';

/** Parameters for the constructor of {@link TargetCardinality}. */
export interface TargetCardinalityProps {
	min: ScalarExpressionType;
	max: ScalarExpressionType;
}

/** A number of targets to select. */
export class TargetCardinality {
	readonly min: ScalarExpressionType;
	readonly max: ScalarExpressionType;

	constructor({ min, max }: TargetCardinalityProps) {
		this.min = min;
		this.max = max;
	}

	/** Whether the target cardinality represents a single target. */
	isSingleTarget(): boolean {
		return this.min === 1 && this.max === 1;
	}

	/** Whether the target cardinality represents multiple targets. */
	isMultipleTargets(): boolean {
		return typeof this.max !== 'number' || this.max > 1;
	}

	/** Whether the target cardinality represents every possible target. */
	isEveryTarget(): boolean {
		return this.min === Infinity && this.max === Infinity;
	}
}

/** Normalises a {@link TargetCardinalitySpec} into a {@link TargetCardinality}. */
export const normaliseTargetCardinality = (spec: TargetCardinalitySpec): TargetCardinality => {
	if (typeof spec === 'number') {
		return new TargetCardinality({ min: spec, max: spec });
	} else if (typeof spec === 'string') {
		if (spec.endsWith('+')) {
			const num = parseInt(spec.slice(0, -1), 10);
			return new TargetCardinality({ min: num, max: Infinity });
		} else if (spec.includes('-')) {
			const [minStr, maxStr] = spec.split('-');
			return new TargetCardinality({ min: parseInt(minStr, 10), max: parseInt(maxStr, 10) });
		} else if (spec === 'every') {
			return new TargetCardinality({ min: Infinity, max: Infinity });
		} else {
			throw new Error(`Invalid TargetCardinalitySpec string: ${spec}`);
		}
	} else if (spec instanceof ScalarExpression || spec instanceof Stat) {
		return new TargetCardinality({ min: spec, max: spec });
	}
	return finalise(TargetCardinality, spec);
};

/** A selection method for a target. Used by {@link Target} if more than one target
 * would match a {@link TargetDiscriminator}. */
export type TargetSelection =
	| 'this'
	| 'player-chosen'
	| 'random'
	| 'closest'
	| 'furthest'
	| { lowest: ScalarExpressionType }
	| { highest: ScalarExpressionType };

/** Constructor parameters for the {@link TargetDiscriminator} class. */
export interface TargetDiscriminatorProps<T extends TargetType = TargetType> {
	/** The type(s) of target. Omit or set to undefined to accept targets of any type. */
	type?: T | ReadonlyArray<T> | ReadonlySet<T>;

	/** An optional condition that must be met for the target to be valid. */
	condition?: BooleanExpressionType;
}

export type TargetDiscriminatorSpec<T extends TargetType = TargetType> =
	| T
	| ReadonlyArray<T>
	| ReadonlySet<T>
	| TargetDiscriminator<T>
	| TargetDiscriminatorProps<T>;

function normalizeTargetType<T extends TargetType>(
	type: T | ReadonlyArray<T> | ReadonlySet<T> | undefined
): Set<T> | undefined {
	if (type === undefined) return undefined;
	if (typeof type === 'string') return new Set([type]);
	return new Set(type);
}

/** Describes a predicate that can be used to determine valid targets for a game effect. */
export class TargetDiscriminator<T extends TargetType = TargetType> {
	/** The type(s) of target, or undefined to accept targets of any type. */
	readonly type: Set<T> | undefined;

	/** An optional condition that must be met for the target to be valid. */
	readonly condition?: BooleanExpressionType;

	constructor(props: T | ReadonlyArray<T> | ReadonlySet<T> | TargetDiscriminatorProps<T>) {
		if (typeof props === 'string') {
			this.type = new Set([props]);
			this.condition = undefined;
		} else if (Array.isArray(props) || props instanceof Set) {
			this.type = new Set(props as Iterable<T>);
			this.condition = undefined;
		} else {
			const p = props as TargetDiscriminatorProps<T>;
			this.type = normalizeTargetType(p.type);
			this.condition = p.condition;
		}
	}

	/** Whether a given target type matches this discriminator. */
	matchesType(targetType: TargetType): boolean {
		return this.type === undefined || this.type.has(targetType as T);
	}
}

/** Constructor parameters for the {@link Target} class. */
export interface TargetProps<
	T extends TargetType = TargetType
> extends TargetDiscriminatorProps<T> {
	/** The number of targets that can be selected. Defaults to 'single'. */
	cardinality?: TargetCardinalitySpec;

	/** The method used to select the target(s). Defaults to 'player-chosen'. */
	selection?: TargetSelection;

	/** Assigns the selected target to a variable, for later reference in other effects
	 * or expressions. */
	variable?: string;
}

export type TargetSpec<T extends TargetType = TargetType> =
	| T
	| ReadonlyArray<T>
	| ReadonlySet<T>
	| Target<T>
	| TargetProps<T>;

/** Describes the process and constraints for selecting a target for a game effect. */
export class Target<T extends TargetType = TargetType> extends TargetDiscriminator<T> {
	/** The number of targets that can be selected. */
	readonly cardinality: TargetCardinality;

	/** The method used to select the target(s). */
	readonly selection: TargetSelection;

	/** The variable to which the selected target(s) will be assigned. */
	readonly variable?: string;

	constructor(props: T | ReadonlyArray<T> | ReadonlySet<T> | TargetProps<T>) {
		super(props);
		if (typeof props === 'string' || Array.isArray(props) || props instanceof Set) {
			this.cardinality = normaliseTargetCardinality(1);
			this.selection = 'player-chosen';
			this.variable = undefined;
		} else {
			const p = props as TargetProps<T>;
			this.cardinality = normaliseTargetCardinality(p.cardinality ?? 1);
			this.selection = p.selection ?? 'player-chosen';
			this.variable = p.variable;
		}
	}
}

export const currentLocation = new Target({ type: 'location', selection: 'closest' });
