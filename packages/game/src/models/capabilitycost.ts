import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { ScalarExpressionType } from './expressions';
import { focusTypes, type FocusType } from './focus';
import type { GameState } from './game/gamestate';
import type { IndicatorType } from './stats';

export type ScalarCapabilityCostType = FocusType | IndicatorType | 'gold' | 'charges';
export type CapabilityCostType = ScalarCapabilityCostType | CardTransitionType;
export type CardTransitionType = 'exhaust' | 'discard';

export class CardTransition {
	readonly type: CardTransitionType;
	readonly title: LocalisedText;

	constructor(type: CardTransitionType, title: LocalisedText) {
		this.type = type;
		this.title = title;
	}
}

export const cardTransitionTypes = ['exhaust', 'discard'] as const;

export const cardTransitions: Record<CardTransitionType, CardTransition> = {
	exhaust: new CardTransition('exhaust', {
		ca: 'Esgotar',
		es: 'Agotar',
		en: 'Exhaust'
	}),
	discard: new CardTransition('discard', {
		ca: 'Descartar',
		es: 'Descartar',
		en: 'Discard'
	})
};

export const scalarCapabilityCostTypes: Array<ScalarCapabilityCostType> = [
	...focusTypes,
	'gold',
	'charges'
];
export const capabilityCostTypes: Array<CapabilityCostType> = [
	...scalarCapabilityCostTypes,
	...cardTransitionTypes
];

export type CapabilityCostFocusesProps<N extends ScalarExpressionType> = Partial<
	Record<FocusType, N>
>;

export interface CapabilityCostProps<
	N extends ScalarExpressionType = ScalarExpressionType
> extends CapabilityCostFocusesProps<N> {
	health?: N;
	sanity?: N;
	gold?: N;
	charges?: N;
	cardTransition?: CardTransitionType | CardTransition;
}

export abstract class BaseCapabilityCost<N extends ScalarExpressionType> {
	readonly strength: N;
	readonly agility: N;
	readonly intelligence: N;
	readonly charisma: N;
	readonly will: N;
	readonly heroism: N;
	readonly any: N;
	readonly health: N;
	readonly sanity: N;
	readonly gold: N;
	readonly charges: N;
	readonly cardTransition?: CardTransition;

	constructor({
		health,
		sanity,
		gold,
		charges,
		cardTransition,
		...focuses
	}: CapabilityCostProps<N>) {
		this.strength = focuses.strength ?? (0 as N);
		this.agility = focuses.agility ?? (0 as N);
		this.intelligence = focuses.intelligence ?? (0 as N);
		this.charisma = focuses.charisma ?? (0 as N);
		this.will = focuses.will ?? (0 as N);
		this.heroism = focuses.heroism ?? (0 as N);
		this.any = focuses.any ?? (0 as N);
		this.health = health ?? (0 as N);
		this.sanity = sanity ?? (0 as N);
		this.gold = gold ?? (0 as N);
		this.charges = charges ?? (0 as N);
		this.cardTransition =
			typeof cardTransition === 'string' ? cardTransitions[cardTransition] : cardTransition;
	}

	getCostForType(type: ScalarCapabilityCostType): N {
		return this[type];
	}

	isFree(): boolean {
		return (
			this.strength === 0 &&
			this.agility === 0 &&
			this.intelligence === 0 &&
			this.charisma === 0 &&
			this.will === 0 &&
			this.heroism === 0 &&
			this.any === 0 &&
			this.health === 0 &&
			this.sanity === 0 &&
			this.charges === 0 &&
			!this.cardTransition
		);
	}
}

export class CapabilityCost extends BaseCapabilityCost<ScalarExpressionType> {
	evaluate(state: GameState): ActualCapabilityCost {
		return new ActualCapabilityCost({
			strength: state.evaluate(this.strength),
			agility: state.evaluate(this.agility),
			intelligence: state.evaluate(this.intelligence),
			charisma: state.evaluate(this.charisma),
			will: state.evaluate(this.will),
			heroism: state.evaluate(this.heroism),
			any: state.evaluate(this.any),
			health: state.evaluate(this.health),
			sanity: state.evaluate(this.sanity),
			gold: state.evaluate(this.gold),
			charges: state.evaluate(this.charges),
			cardTransition: this.cardTransition
		});
	}
}

export class ActualCapabilityCost extends BaseCapabilityCost<number> {}
