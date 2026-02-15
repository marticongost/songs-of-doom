import type { LocalisedText } from '@songsofdoom/common/localisation';
import type { ScalarExpressionType } from './expressions';
import { focusTypes, type FocusType } from './focus';
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

export type CapabilityCostFocusesProps = Partial<Record<FocusType, ScalarExpressionType>>;

export interface CapabilityCostProps extends CapabilityCostFocusesProps {
	health?: number;
	sanity?: number;
	gold?: number;
	charges?: number;
	cardTransition?: CardTransitionType | CardTransition;
}

export class CapabilityCost {
	readonly strength: ScalarExpressionType;
	readonly agility: ScalarExpressionType;
	readonly intelligence: ScalarExpressionType;
	readonly charisma: ScalarExpressionType;
	readonly will: ScalarExpressionType;
	readonly heroism: ScalarExpressionType;
	readonly any: ScalarExpressionType;
	readonly health: number;
	readonly sanity: number;
	readonly gold: number;
	readonly charges: number;
	readonly cardTransition?: CardTransition;

	constructor({ health, sanity, gold, charges, cardTransition, ...focuses }: CapabilityCostProps) {
		this.strength = focuses.strength ?? 0;
		this.agility = focuses.agility ?? 0;
		this.intelligence = focuses.intelligence ?? 0;
		this.charisma = focuses.charisma ?? 0;
		this.will = focuses.will ?? 0;
		this.heroism = focuses.heroism ?? 0;
		this.any = focuses.any ?? 0;
		this.health = health ?? 0;
		this.sanity = sanity ?? 0;
		this.gold = gold ?? 0;
		this.charges = charges ?? 0;
		this.cardTransition =
			typeof cardTransition === 'string' ? cardTransitions[cardTransition] : cardTransition;
	}

	getCostForType(type: ScalarCapabilityCostType): ScalarExpressionType {
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
