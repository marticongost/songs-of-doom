import type { Effect } from './effect';

export type OneOfEffectProps = Array<Effect> | { effects: Array<Effect> };

export class OneOfEffect {
	readonly effects: Array<Effect>;

	constructor(props: OneOfEffectProps) {
		this.effects = props instanceof Array ? props : props.effects;
	}
}
