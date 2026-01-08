import { Effect, type EffectProps } from './effect';

export interface ModifyRollEffectProps extends EffectProps {
	modifier: number;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: number;

	constructor({ modifier, properties }: ModifyRollEffectProps) {
		super({ properties });
		this.modifier = modifier;
	}
}
