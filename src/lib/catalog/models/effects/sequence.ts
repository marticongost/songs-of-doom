import type { Effect } from './effect';

export type SequenceEffectProps = Array<Effect> | { effects: Array<Effect> };

export class SequenceEffect {
	readonly effects: Array<Effect>;

	constructor(props: SequenceEffectProps) {
		this.effects = props instanceof Array ? props : props.effects;
	}
}
