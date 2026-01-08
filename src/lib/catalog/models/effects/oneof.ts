import { Effect, type EffectProps } from './effect';

export type OneOfEffectProps = Array<Effect> | ({ effects: Array<Effect> } & EffectProps);

export class OneOfEffect extends Effect {
	readonly effects: Array<Effect>;

	constructor(props: OneOfEffectProps) {
		super({ properties: props instanceof Array ? [] : props.properties });
		this.effects = props instanceof Array ? props : props.effects;
	}
}
