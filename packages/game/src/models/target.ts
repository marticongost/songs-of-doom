import type { BooleanExpressionType, ScalarExpressionType } from './expressions';

/** A subset of {@link TargetType} that can be used to designate players. */
export type PlayerTargetType = 'owner' | 'active-player';

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

/** Whether a target can designate a single entity or multiple entities. */
export type TargetCardinality = 'single' | 'multiple';

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
}

/** Constructor parameters for the {@link Target} class. */
export interface TargetProps<
	T extends TargetType = TargetType
> extends TargetDiscriminatorProps<T> {
	/** The number of targets that can be selected. Defaults to 'single'. */
	cardinality?: TargetCardinality;

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
			this.cardinality = 'single';
			this.selection = 'player-chosen';
			this.variable = undefined;
		} else {
			const p = props as TargetProps<T>;
			this.cardinality = p.cardinality ?? 'single';
			this.selection = p.selection ?? 'player-chosen';
			this.variable = p.variable;
		}
	}
}

export const currentLocation = new Target({ type: 'location', selection: 'closest' });
