import type { BooleanExpressionType } from './expressions';

export type TargetType =
	| 'self'
	| 'attacker'
	| 'defender'
	| 'enemy'
	| 'allEnemies'
	| 'ally'
	| 'allAllies'
	| 'object'
	| 'allObjects'
	| 'ownedObject'
	| 'allOwnedObjects';

export type TargetProps =
	| TargetType
	| {
			type: TargetType;
			condition?: BooleanExpressionType;
	  };

export class Target {
	readonly type: TargetType;
	readonly condition?: BooleanExpressionType;

	constructor(props: TargetProps) {
		if (typeof props === 'string') {
			this.type = props;
			this.condition = undefined;
		} else {
			this.type = props.type;
			this.condition = props.condition;
		}
	}
}
