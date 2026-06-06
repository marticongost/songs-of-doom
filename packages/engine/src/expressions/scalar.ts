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

type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

// ---- Concrete scalar expressions ----

evaluate.implementFor(CashExpression, function (this: CashExpression, _state: State): number {
	// TODO
	return 0;
});

evaluate.implementFor(ChargesExpression, function (this: ChargesExpression, _state: State): number {
	// TODO
	return 0;
});

evaluate.implementFor(CountExpression, function (this: CountExpression, _state: State): number {
	// TODO
	return 0;
});

evaluate.implementFor(
	DistanceExpression,
	function (this: DistanceExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	EffectiveDefenseExpression,
	function (this: EffectiveDefenseExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	HandSizeExpression,
	function (this: HandSizeExpression, state: State): number {
		return state.requireActivePlayer().hand.length;
	}
);

evaluate.implementFor(
	ProficiencyExpression,
	function (this: ProficiencyExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	RemainingWoundsExpression,
	function (this: RemainingWoundsExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	ReceivedWoundsExpression,
	function (this: ReceivedWoundsExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(ResultExpression, function (this: ResultExpression, _state: State): number {
	// TODO
	return 0;
});

evaluate.implementFor(ScalarOperation, function (this: ScalarOperation, state: State): number {
	const leftValue = state.evaluate(this.left);
	const rightValue = state.evaluate(this.right);
	switch (this.operator) {
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
	function (this: TalentProficiencyExpression, _state: State): number {
		// TODO
		return 0;
	}
);

evaluate.implementFor(
	VariableExpression,
	function (this: VariableExpression, _state: State): number {
		// TODO
		return 0;
	}
);

// ---- Stat ----

evaluate.implementFor(Stat, function (this: Stat, state: State): number {
	return state.requireActivePlayer().getStat(this);
});
