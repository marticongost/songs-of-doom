import type { Condition } from './conditions';

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
			conditions?: Array<Condition>;
	  };

export class Target {
	readonly type: TargetType;
	readonly conditions: Array<Condition>;

	constructor(props: TargetProps) {
		if (typeof props === 'string') {
			this.type = props;
			this.conditions = [];
		} else {
			this.type = props.type;
			this.conditions = props.conditions ?? [];
		}
	}
}
