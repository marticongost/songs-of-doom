import {
	CashExpression,
	ChargesExpression,
	CountExpression,
	DistanceExpression,
	EffectiveDefenseExpression,
	HandSizeExpression,
	ProficiencyExpression,
	ReceivedWoundsExpression,
	RemainingWoundsExpression,
	ResultExpression,
	ScalarOperation,
	Stat,
	TalentProficiencyExpression,
	VariableExpression
} from '@songsofdoom/game';
import type { CardState } from '../state/cardstate';
import type { GameState } from '../state/gamestate';
import type { LocationState } from '../state/locationstate';
import type { PlayerState } from '../state/playerstate';
import { evaluateScalar } from './evaluate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

// ---- Concrete scalar expressions ----

evaluateScalar.implementFor(CashExpression, (_expr: CashExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluateScalar.implementFor(
	ChargesExpression,
	(_expr: ChargesExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(CountExpression, (_expr: CountExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluateScalar.implementFor(
	DistanceExpression,
	(_expr: DistanceExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(
	EffectiveDefenseExpression,
	(_expr: EffectiveDefenseExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(
	HandSizeExpression,
	(_expr: HandSizeExpression, state: State): number => {
		return state.requireActivePlayer().hand.length;
	}
);

evaluateScalar.implementFor(
	ProficiencyExpression,
	(_expr: ProficiencyExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(
	RemainingWoundsExpression,
	(_expr: RemainingWoundsExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(
	ReceivedWoundsExpression,
	(_expr: ReceivedWoundsExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(ResultExpression, (_expr: ResultExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluateScalar.implementFor(ScalarOperation, (expr: ScalarOperation, state: State): number => {
	const leftValue = state.evaluateScalar(expr.left);
	const rightValue = state.evaluateScalar(expr.right);
	switch (expr.operator) {
		case '+':
			return leftValue + rightValue;
		case '-':
			return leftValue - rightValue;
		case '*':
			return leftValue * rightValue;
		case '/':
			return leftValue / rightValue;
	}
});

evaluateScalar.implementFor(
	TalentProficiencyExpression,
	(_expr: TalentProficiencyExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluateScalar.implementFor(
	VariableExpression,
	(_expr: VariableExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

// ---- Stat ----

evaluateScalar.implementFor(Stat, (stat: Stat, state: State): number => {
	return state.requireActivePlayer().getStat(stat);
});
