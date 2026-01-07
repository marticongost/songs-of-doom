import { Effect } from './effect';

export type SequenceEffectProps = Array<Effect> | { effects: Array<Effect> };

export class SequenceEffect extends Effect {
	readonly effects: Array<Effect>;

	constructor(props: SequenceEffectProps) {
		super();
		this.effects = props instanceof Array ? props : props.effects;
	}
}
