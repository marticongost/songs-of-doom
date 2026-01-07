import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: number;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: number;

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}
}
