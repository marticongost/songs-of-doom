import type { Counter, ReadonlyCounter } from '@songsofdoom/common';
import type { CardTransition, FocusToken } from '@songsofdoom/game';
import type { CardId } from './identifiers';

/**
 * Constructor parameters for the {@link Payment} class.
 */

export interface PaymentProps {
	spentFocuses: Counter<FocusToken>;
	spentCards: Set<CardId>;
	spentCharges?: number;
	spentHealth?: number;
	spentSanity?: number;
	spentGold?: number;
	cardTransition?: CardTransition;
}
/**
 * The payment made for a capability cost.
 *
 * Indicates which focus tokens or cards were spent to satisfy a capability cost.
 */

export class Payment {
	readonly spentFocuses: ReadonlyCounter<FocusToken>;
	readonly spentCards: ReadonlySet<CardId>;
	readonly spentCharges: number;
	readonly spentHealth: number;
	readonly spentSanity: number;
	readonly spentGold: number;
	readonly cardTransition?: CardTransition;

	constructor({
		spentFocuses,
		spentCards,
		spentCharges,
		spentHealth,
		spentSanity,
		spentGold,
		cardTransition
	}: PaymentProps) {
		this.spentFocuses = spentFocuses;
		this.spentCards = spentCards;
		this.spentCharges = spentCharges ?? 0;
		this.spentHealth = spentHealth ?? 0;
		this.spentSanity = spentSanity ?? 0;
		this.spentGold = spentGold ?? 0;
		this.cardTransition = cardTransition;
	}
}
