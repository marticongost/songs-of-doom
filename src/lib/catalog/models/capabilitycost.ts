import type { LocalisedText } from '$lib/localisation';
import { focusTypes, type FocusesProps, type FocusType } from './focus';
import type { IndicatorType } from './stats';

export type ScalarCapabilityCostType = FocusType | IndicatorType | 'charges';
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
	'charges'
];
export const capabilityCostTypes: Array<CapabilityCostType> = [
	...scalarCapabilityCostTypes,
	...cardTransitionTypes
];

export interface CapabilityCostProps extends FocusesProps {
	health?: number;
	sanity?: number;
	charges?: number;
	cardTransition?: CardTransitionType | CardTransition;
}

export class CapabilityCost implements Readonly<Record<FocusType, number>> {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;
	readonly will: number;
	readonly heroism: number;
	readonly any: number;
	readonly health: number;
	readonly sanity: number;
	readonly charges: number;
	readonly cardTransition?: CardTransition;

	constructor({ health, sanity, charges, cardTransition, ...focuses }: CapabilityCostProps) {
		this.strength = focuses.strength ?? 0;
		this.agility = focuses.agility ?? 0;
		this.intelligence = focuses.intelligence ?? 0;
		this.charisma = focuses.charisma ?? 0;
		this.will = focuses.will ?? 0;
		this.heroism = focuses.heroism ?? 0;
		this.any = focuses.any ?? 0;
		this.health = health ?? 0;
		this.sanity = sanity ?? 0;
		this.charges = charges ?? 0;
		this.cardTransition =
			typeof cardTransition === 'string' ? cardTransitions[cardTransition] : cardTransition;
	}

	get(costType: ScalarCapabilityCostType): number {
		return this[costType];
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
