import type { BooleanExpressionType, ScalarExpressionType } from './expressions';

export type TargetType =
	| 'owner'
	| 'active-player'
	| 'attacker'
	| 'defender'
	| 'enemy'
	| 'ally'
	| 'object'
	| 'location';

export type TargetCardinality = 'single' | 'multiple';

export type TargetSelection =
	| 'player-chosen'
	| 'random'
	| 'closest'
	| 'furthest'
	| { lowest: ScalarExpressionType }
	| { highest: ScalarExpressionType };

export interface TargetDiscriminatorProps {
	type: TargetType;
	condition?: BooleanExpressionType;
}

export type TargetDiscriminatorSpec = TargetType | TargetDiscriminator | TargetDiscriminatorProps;

export class TargetDiscriminator {
	readonly type: TargetType;
	readonly condition?: BooleanExpressionType;

	constructor(props: TargetType | TargetDiscriminatorProps) {
		if (typeof props === 'string') {
			this.type = props;
			this.condition = undefined;
		} else {
			this.type = props.type;
			this.condition = props.condition;
		}
	}
}

export interface TargetProps extends TargetDiscriminatorProps {
	cardinality?: TargetCardinality;
	selection?: TargetSelection;
}

export type TargetSpec = TargetType | Target | TargetProps;

export class Target extends TargetDiscriminator {
	readonly cardinality: TargetCardinality;
	readonly selection: TargetSelection;

	constructor(props: TargetType | TargetProps) {
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
