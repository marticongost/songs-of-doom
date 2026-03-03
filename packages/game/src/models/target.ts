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
	| 'player-chosen'
	| 'random'
	| 'closest'
	| 'furthest'
	| { lowest: ScalarExpressionType }
	| { highest: ScalarExpressionType };

/** Constructor parameters for the {@link TargetDiscriminator} class. */
export interface TargetDiscriminatorProps<T extends TargetType = TargetType> {
	/** The type of target. */
	type: T;

	/** An optional condition that must be met for the target to be valid. */
	condition?: BooleanExpressionType;
}

export type TargetDiscriminatorSpec<T extends TargetType = TargetType> =
	| T
	| TargetDiscriminator<T>
	| TargetDiscriminatorProps<T>;

/** Describes a predicate that can be used to determine valid targets for a game effect. */
export class TargetDiscriminator<T extends TargetType = TargetType> {
	/** The type of target. */
	readonly type: T;

	/** An optional condition that must be met for the target to be valid. */
	readonly condition?: BooleanExpressionType;

	constructor(props: T | TargetDiscriminatorProps<T>) {
		if (typeof props === 'string') {
			this.type = props;
			this.condition = undefined;
		} else {
			this.type = props.type;
			this.condition = props.condition;
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
}

export type TargetSpec<T extends TargetType = TargetType> = T | Target<T> | TargetProps<T>;

/** Describes the process and constraints for selecting a target for a game effect. */
export class Target<T extends TargetType = TargetType> extends TargetDiscriminator<T> {
	/** The number of targets that can be selected. */
	readonly cardinality: TargetCardinality;

	/** The method used to select the target(s). */
	readonly selection: TargetSelection;

	constructor(props: T | TargetProps<T>) {
		super(props);
		if (typeof props === 'string') {
			this.cardinality = 'single';
			this.selection = 'player-chosen';
		} else {
			this.cardinality = props.cardinality ?? 'single';
			this.selection = props.selection ?? 'player-chosen';
		}
	}
}
