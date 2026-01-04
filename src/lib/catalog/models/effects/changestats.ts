export interface ChangeStatsEffectProps {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
	health?: number;
	sanity?: number;
}

export class ChangeStatsEffect {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;
	readonly health: number;
	readonly sanity: number;

	constructor({
		strength,
		agility,
		intelligence,
		charisma,
		health,
		sanity
	}: ChangeStatsEffectProps) {
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
		this.health = health ?? 0;
		this.sanity = sanity ?? 0;
	}
}
