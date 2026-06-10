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
import { evaluate } from './evaluate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

// ---- Concrete scalar expressions ----

evaluate.implementFor(CashExpression, (_expr: CashExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluate.implementFor(ChargesExpression, (_expr: ChargesExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluate.implementFor(CountExpression, (_expr: CountExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluate.implementFor(DistanceExpression, (_expr: DistanceExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluate.implementFor(
	EffectiveDefenseExpression,
	(_expr: EffectiveDefenseExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluate.implementFor(HandSizeExpression, (_expr: HandSizeExpression, state: State): number => {
	return state.requireActivePlayer().hand.length;
});

evaluate.implementFor(
	ProficiencyExpression,
	(_expr: ProficiencyExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	RemainingWoundsExpression,
	(_expr: RemainingWoundsExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	ReceivedWoundsExpression,
	(_expr: ReceivedWoundsExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluate.implementFor(ResultExpression, (_expr: ResultExpression, _state: State): number => {
	// TODO
	return 0;
});

evaluate.implementFor(ScalarOperation, (expr: ScalarOperation, state: State): number => {
	const leftValue = state.evaluate(expr.left);
	const rightValue = state.evaluate(expr.right);
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

evaluate.implementFor(
	TalentProficiencyExpression,
	(_expr: TalentProficiencyExpression, _state: State): number => {
		// TODO
		return 0;
	}
);

evaluate.implementFor(VariableExpression, (_expr: VariableExpression, _state: State): number => {
	// TODO
	return 0;
});

// ---- Stat ----

evaluate.implementFor(Stat, (stat: Stat, state: State): number => {
	return state.requireActivePlayer().getStat(stat);
});
