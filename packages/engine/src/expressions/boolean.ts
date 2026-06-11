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
import { evaluateBoolean } from './evaluate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = GameState<CardState<any>, PlayerState<CardState<any>>, LocationState>;

// ---- Concrete boolean expressions ----

evaluateBoolean.implementFor(
	ActivatedExpression,
	(_expr: ActivatedExpression, state: State): boolean => {
		const subject = state.getSubject();
		return subject?.activated ?? false;
	}
);

evaluateBoolean.implementFor(
	ComparisonExpression,
	(expr: ComparisonExpression, state: State): boolean => {
		const leftValue = state.evaluateScalar(expr.left);
		const rightValue = state.evaluateScalar(expr.right);
		switch (expr.operator) {
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

evaluateBoolean.implementFor(
	EngagedExpression,
	(_expr: EngagedExpression, _state: State): boolean => {
		// TODO
		return false;
	}
);

evaluateBoolean.implementFor(
	ExhaustedExpression,
	(_expr: ExhaustedExpression, state: State): boolean => {
		const subject = state.getSubject();
		return subject !== undefined && subject instanceof CardState && subject.exhausted;
	}
);

evaluateBoolean.implementFor(IsExpression, (_expr: IsExpression, _state: State): boolean => {
	// TODO
	return false;
});

evaluateBoolean.implementFor(OwnedExpression, (_expr: OwnedExpression, _state: State): boolean => {
	// TODO
	return false;
});

evaluateBoolean.implementFor(
	CopyAlreadyAttachedExpression,
	(_expr: CopyAlreadyAttachedExpression, _state: State): boolean => {
		// TODO
		return false;
	}
);

// ---- Logical operators ----

function evaluateBooleanHelper(state: State, operand: BooleanExpressionType): boolean {
	if (typeof operand === 'boolean') return operand;
	return evaluateBoolean(operand, state);
}

evaluateBoolean.implementFor(AndExpression, (expr: AndExpression, state: State): boolean => {
	return expr.operands.every((operand) => evaluateBooleanHelper(state, operand));
});

evaluateBoolean.implementFor(OrExpression, (expr: OrExpression, state: State): boolean => {
	return expr.operands.some((operand) => evaluateBooleanHelper(state, operand));
});

evaluateBoolean.implementFor(NotExpression, (expr: NotExpression, state: State): boolean => {
	return !evaluateBooleanHelper(state, expr.operand);
});

// ---- Event context expressions ----

evaluateBoolean.implementFor(
	ActiveCardIsTargetExpression,
	(_expr: ActiveCardIsTargetExpression, state: State): boolean => {
		const activeCard = state.getActiveCard();
		const target = state.getTarget();
		return activeCard !== undefined && target !== undefined && activeCard.id === target.id;
	}
);

evaluateBoolean.implementFor(
	ActiveCardIsActorExpression,
	(_expr: ActiveCardIsActorExpression, state: State): boolean => {
		const activeCard = state.getActiveCard();
		const subject = state.getSubject();
		return activeCard !== undefined && subject !== undefined && activeCard.id === subject.id;
	}
);

evaluateBoolean.implementFor(
	ActiveCardOwnerIsNotActivePlayerExpression,
	(_expr: ActiveCardOwnerIsNotActivePlayerExpression, state: State): boolean => {
		const reactivePlayer = state.getReactivePlayer();
		const activePlayer = state.getActivePlayer();
		return (
			reactivePlayer !== undefined &&
			activePlayer !== undefined &&
			reactivePlayer.id !== activePlayer.id
		);
	}
);

evaluateBoolean.implementFor(
	ReactivePlayerIsTargetExpression,
	(_expr: ReactivePlayerIsTargetExpression, state: State): boolean => {
		const reactivePlayer = state.getReactivePlayer();
		const target = state.getTarget();
		return reactivePlayer !== undefined && target !== undefined && reactivePlayer.id === target.id;
	}
);

evaluateBoolean.implementFor(
	ReactivePlayerIsSubjectExpression,
	(_expr: ReactivePlayerIsSubjectExpression, state: State): boolean => {
		const reactivePlayer = state.getReactivePlayer();
		const subject = state.getSubject();
		return (
			reactivePlayer !== undefined && subject !== undefined && reactivePlayer.id === subject.id
		);
	}
);

evaluateBoolean.implementFor(
	ReactiveCardIsSubjectExpression,
	(_expr: ReactiveCardIsSubjectExpression, state: State): boolean => {
		const reactiveCard = state.getReactiveCard();
		const subject = state.getSubject();
		return reactiveCard !== undefined && subject !== undefined && reactiveCard.id === subject.id;
	}
);

evaluateBoolean.implementFor(
	ReactiveCardIsTargetExpression,
	(_expr: ReactiveCardIsTargetExpression, state: State): boolean => {
		const reactiveCard = state.getReactiveCard();
		const target = state.getTarget();
		return reactiveCard !== undefined && target !== undefined && reactiveCard.id === target.id;
	}
);

evaluateBoolean.implementFor(
	ActiveCardHasTypeExpression,
	(expr: ActiveCardHasTypeExpression, state: State): boolean => {
		const activeCard = state.getActiveCard();
		return activeCard !== undefined && activeCard.card.type.id === expr.type.id;
	}
);

// ---- Property ----

evaluateBoolean.implementFor(Property, (_expr: Property, _state: State): boolean => {
	// TODO: choose the current target
	return false;
});
