export interface ModifyRollEffectProps {
	modifier: number;
}

export class ModifyRollEffect {
	readonly modifier: number;

	constructor({ modifier }: ModifyRollEffectProps) {
		this.modifier = modifier;
	}
}
