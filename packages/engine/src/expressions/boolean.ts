import {
	ActivatedExpression,
	ActiveCardHasTypeExpression,
	ActiveCardIsActorExpression,
	ActiveCardIsTargetExpression,
	ActiveCardOwnerIsNotActivePlayerExpression,
	AndExpression,
	ComparisonExpression,
	CopyAlreadyAttachedExpression,
	EngagedExpression,
	ExhaustedExpression,
	IsExpression,
	NotExpression,
	OrExpression,
	OwnedExpression,
	Property,
	ReactiveCardIsSubjectExpression,
	ReactiveCardIsTargetExpression,
	ReactivePlayerIsSubjectExpression,
	ReactivePlayerIsTargetExpression,
	type BooleanExpressionType
} from '@songsofdoom/game';
import { CardState } from '../state/cardstate';
import type { GameState } from '../state/gamestate';
import type { LocationState } from '../state/locationstate';
import type { PlayerState } from '../state/playerstate';
import { evaluate } from './evaluate';

type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

// ---- Concrete boolean expressions ----

evaluate.implementFor(
	ActivatedExpression,
	function (this: ActivatedExpression, state: State): boolean {
		const subject = state.getSubject();
		return subject?.activated ?? false;
	}
);

evaluate.implementFor(
	ComparisonExpression,
	function (this: ComparisonExpression, state: State): boolean {
		const leftValue = state.evaluate(this.left);
		const rightValue = state.evaluate(this.right);
		switch (this.operator) {
			case '>':
				return leftValue > rightValue;
			case '<':
				return leftValue < rightValue;
			case '=':
				return leftValue === rightValue;
			case '!=':
				return leftValue !== rightValue;
		}
	}
);

evaluate.implementFor(
	EngagedExpression,
	function (this: EngagedExpression, _state: State): boolean {
		// TODO
		return false;
	}
);

evaluate.implementFor(
	ExhaustedExpression,
	function (this: ExhaustedExpression, state: State): boolean {
		const subject = state.getSubject();
		return subject !== undefined && subject instanceof CardState && subject.exhausted;
	}
);

evaluate.implementFor(IsExpression, function (this: IsExpression, _state: State): boolean {
	// TODO
	return false;
});

evaluate.implementFor(OwnedExpression, function (this: OwnedExpression, _state: State): boolean {
	// TODO
	return false;
});

evaluate.implementFor(
	CopyAlreadyAttachedExpression,
	function (this: CopyAlreadyAttachedExpression, _state: State): boolean {
		// TODO
		return false;
	}
);

// ---- Logical operators ----

function evaluateBoolean(state: State, operand: BooleanExpressionType): boolean {
	if (typeof operand === 'boolean') return operand;
	return evaluate(operand, state) as boolean;
}

evaluate.implementFor(AndExpression, function (this: AndExpression, state: State): boolean {
	return this.operands.every((operand) => evaluateBoolean(state, operand));
});

evaluate.implementFor(OrExpression, function (this: OrExpression, state: State): boolean {
	return this.operands.some((operand) => evaluateBoolean(state, operand));
});

evaluate.implementFor(NotExpression, function (this: NotExpression, state: State): boolean {
	return !evaluateBoolean(state, this.operand);
});

// ---- Event context expressions ----

evaluate.implementFor(
	ActiveCardIsTargetExpression,
	function (this: ActiveCardIsTargetExpression, state: State): boolean {
		const activeCard = state.getActiveCard();
		const target = state.getTarget();
		return activeCard !== undefined && target !== undefined && activeCard.id === target.id;
	}
);

evaluate.implementFor(
	ActiveCardIsActorExpression,
	function (this: ActiveCardIsActorExpression, state: State): boolean {
		const activeCard = state.getActiveCard();
		const subject = state.getSubject();
		return activeCard !== undefined && subject !== undefined && activeCard.id === subject.id;
	}
);

evaluate.implementFor(
	ActiveCardOwnerIsNotActivePlayerExpression,
	function (this: ActiveCardOwnerIsNotActivePlayerExpression, state: State): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const activePlayer = state.getActivePlayer();
		return (
			reactivePlayer !== undefined &&
			activePlayer !== undefined &&
			reactivePlayer.id !== activePlayer.id
		);
	}
);

evaluate.implementFor(
	ReactivePlayerIsTargetExpression,
	function (this: ReactivePlayerIsTargetExpression, state: State): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const target = state.getTarget();
		return reactivePlayer !== undefined && target !== undefined && reactivePlayer.id === target.id;
	}
);

evaluate.implementFor(
	ReactivePlayerIsSubjectExpression,
	function (this: ReactivePlayerIsSubjectExpression, state: State): boolean {
		const reactivePlayer = state.getReactivePlayer();
		const subject = state.getSubject();
		return (
			reactivePlayer !== undefined && subject !== undefined && reactivePlayer.id === subject.id
		);
	}
);

evaluate.implementFor(
	ReactiveCardIsSubjectExpression,
	function (this: ReactiveCardIsSubjectExpression, state: State): boolean {
		const reactiveCard = state.getReactiveCard();
		const subject = state.getSubject();
		return reactiveCard !== undefined && subject !== undefined && reactiveCard.id === subject.id;
	}
);

evaluate.implementFor(
	ReactiveCardIsTargetExpression,
	function (this: ReactiveCardIsTargetExpression, state: State): boolean {
		const reactiveCard = state.getReactiveCard();
		const target = state.getTarget();
		return reactiveCard !== undefined && target !== undefined && reactiveCard.id === target.id;
	}
);

evaluate.implementFor(
	ActiveCardHasTypeExpression,
	function (this: ActiveCardHasTypeExpression, state: State): boolean {
		const activeCard = state.getActiveCard();
		return activeCard !== undefined && activeCard.card.type.id === this.type.id;
	}
);

// ---- Property ----

evaluate.implementFor(Property, function (this: Property, _state: State): boolean {
	// TODO: choose the current target
	return false;
});
