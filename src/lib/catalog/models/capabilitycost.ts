import type { StatType } from './stats';

export interface CapabilityCostProps {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
	exhaust?: boolean;
	charges?: number;
}

export class CapabilityCost {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;
	readonly exhaust: boolean;
	readonly charges: number;

	constructor({
		strength,
		agility,
		intelligence,
		charisma,
		exhaust,
		charges
	}: CapabilityCostProps) {
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
		this.exhaust = exhaust ?? false;
		this.charges = charges ?? 0;
	}

	isFree(): boolean {
		return (
			this.strength === 0 &&
			this.agility === 0 &&
			this.intelligence === 0 &&
			this.charisma === 0 &&
			!this.exhaust &&
			this.charges === 0
		);
	}

	get(stat: StatType): number {
		return this[stat];
	}
}
