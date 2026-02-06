import type { BooleanExpressionType } from './expressions';

export type TargetType = 'self' | 'attacker' | 'defender' | 'enemy' | 'ally' | 'object';

export type TargetCardinality = 'single' | 'multiple';

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
}

export type TargetSpec = TargetType | Target | TargetProps;

export class Target extends TargetDiscriminator {
	readonly cardinality: TargetCardinality;

	constructor(props: TargetType | TargetProps) {
		super(props);
		if (typeof props === 'string') {
			this.cardinality = 'single';
		} else {
			this.cardinality = props.cardinality ?? 'single';
		}
	}
}
