import { aptitudeTypes, type AptitudesProps, type AptitudeType } from './aptitude';
import type { IndicatorType } from './stats';

export type ScalarCapabilityCostType = AptitudeType | IndicatorType | 'charges';
export type CapabilityCostType = ScalarCapabilityCostType | 'exhaust';

export const scalarCapabilityCostTypes: Array<ScalarCapabilityCostType> = [
	...aptitudeTypes,
	'charges'
];
export const capabilityCostTypes: Array<CapabilityCostType> = [
	...scalarCapabilityCostTypes,
	'exhaust'
];

export interface CapabilityCostProps extends AptitudesProps {
	health?: number;
	sanity?: number;
	exhaust?: boolean;
	charges?: number;
}

export class CapabilityCost implements Readonly<Record<AptitudeType, number>> {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;
	readonly will: number;
	readonly focus: number;
	readonly any: number;
	readonly health: number;
	readonly sanity: number;
	readonly exhaust: boolean;
	readonly charges: number;

	constructor({ health, sanity, exhaust, charges, ...aptitudes }: CapabilityCostProps) {
		this.strength = aptitudes.strength ?? 0;
		this.agility = aptitudes.agility ?? 0;
		this.intelligence = aptitudes.intelligence ?? 0;
		this.charisma = aptitudes.charisma ?? 0;
		this.will = aptitudes.will ?? 0;
		this.focus = aptitudes.focus ?? 0;
		this.any = aptitudes.any ?? 0;
		this.health = health ?? 0;
		this.sanity = sanity ?? 0;
		this.exhaust = exhaust ?? false;
		this.charges = charges ?? 0;
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
			this.focus === 0 &&
			this.any === 0 &&
			this.health === 0 &&
			this.sanity === 0 &&
			this.charges === 0 &&
			!this.exhaust
		);
	}
}
