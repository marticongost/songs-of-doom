import { Effect, type EffectProps } from './effect';

export type SequenceEffectProps = Array<Effect> | ({ effects: Array<Effect> } & EffectProps);

export class SequenceEffect extends Effect {
	readonly effects: Array<Effect>;

	constructor(props: SequenceEffectProps) {
		super({ properties: props instanceof Array ? [] : props.properties });
		this.effects = props instanceof Array ? props : props.effects;
	}
}
