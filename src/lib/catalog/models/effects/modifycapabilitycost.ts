export interface ModifyCapabilityCostEffectProps {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
}

export class ModifyCapabilityCostEffect {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;

	constructor({ strength, agility, intelligence, charisma }: ModifyCapabilityCostEffectProps) {
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
	}
}
