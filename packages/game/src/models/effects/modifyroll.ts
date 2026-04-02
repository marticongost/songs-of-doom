import type { ScalarExpressionType } from '../expressions';
import { ScalarExpression } from '../expressions';
import type { GameGraph } from '../game/gamegraph';
import type { MutableGameState } from '../game/gamestate';
import { Effect } from './effect';

export interface ModifyRollEffectProps {
	modifier: ScalarExpressionType;
}

export class ModifyRollEffect extends Effect {
	readonly modifier: ScalarExpressionType;

	constructor({ modifier }: ModifyRollEffectProps) {
		super();
		this.modifier = modifier;
	}

	override async trigger(gameGraph: GameGraph) {
		gameGraph.effectTriggered<ModifyRollEffect>(this, (_state: MutableGameState) => {
			// TODO
		});
	}
}

const isScalar = (v: ScalarExpressionType | ModifyRollEffectProps): v is ScalarExpressionType =>
	typeof v === 'number' || typeof v === 'string' || v instanceof ScalarExpression;

/** Creates a modify roll effect. */
export const modifyRoll = (
	modifierOrProps: ScalarExpressionType | ModifyRollEffectProps
): ModifyRollEffect =>
	new ModifyRollEffect(isScalar(modifierOrProps) ? { modifier: modifierOrProps } : modifierOrProps);
