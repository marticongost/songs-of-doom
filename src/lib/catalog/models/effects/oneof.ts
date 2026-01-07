import { Effect } from './effect';

export type OneOfEffectProps = Array<Effect> | { effects: Array<Effect> };

export class OneOfEffect extends Effect {
	readonly effects: Array<Effect>;

	constructor(props: OneOfEffectProps) {
		super();
		this.effects = props instanceof Array ? props : props.effects;
	}
}
