export type TargetType = 'self' | 'enemy' | 'allEnemies' | 'ally' | 'allAllies';

export type TargetProps =
	| TargetType
	| {
			type: TargetType;
	  };

export class Target {
	readonly type: TargetType;
	constructor(props: TargetProps) {
		this.type = typeof props === 'string' ? props : props.type;
	}
}
