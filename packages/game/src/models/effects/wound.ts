import { finalise } from '@songsofdoom/common';
import type { GameGraph } from '../game/gamegraph';
import type { Property } from '../properties';
import { Target, type TargetSpec } from '../target';
import { Effect } from './effect';

export interface WoundEffectProps {
	damage: number;
	target?: TargetSpec;
	properties?: Array<Property>;
}

export class WoundEffect extends Effect {
	readonly damage: number;
	readonly target?: Target;
	readonly properties: Array<Property>;

	constructor({ damage, target, properties }: WoundEffectProps) {
		super();
		this.damage = damage;
		this.target = finalise(Target, target);
		this.properties = properties ?? [];
	}

	override async apply(_gameGraph: GameGraph) {
		// TODO
	}
}

/** Creates an effect that inflicts a wound. */
export const wound = (damageOrProps: number | WoundEffectProps): WoundEffect =>
	new WoundEffect(typeof damageOrProps === 'number' ? { damage: damageOrProps } : damageOrProps);
