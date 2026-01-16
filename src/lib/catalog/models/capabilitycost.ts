import { Aptitudes, type AptitudesProps } from './aptitude';

export interface CapabilityCostProps extends AptitudesProps {
	exhaust?: boolean;
	charges?: number;
}

export class CapabilityCost extends Aptitudes {
	readonly exhaust: boolean;
	readonly charges: number;

	constructor({
		strength,
		agility,
		intelligence,
		charisma,
		will,
		focus,
		exhaust,
		charges
	}: CapabilityCostProps) {
		super({ strength, agility, intelligence, charisma, will, focus });
		this.exhaust = exhaust ?? false;
		this.charges = charges ?? 0;
	}

	empty(): boolean {
		return super.empty() && !this.exhaust && this.charges === 0;
	}

	isFree(): boolean {
		return !this.empty();
	}
}
