import { statTypes, type StatType } from '../stats';

export interface ChangeStatsEffectProps {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
	health?: number;
	sanity?: number;
}

export interface GrouppedStatChanges {
	increase?: Partial<Record<StatType, number>>;
	decrease?: Partial<Record<StatType, number>>;
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

	get(stat: StatType): number {
		return this[stat];
	}

	group(): GrouppedStatChanges {
		const groups = { increase: undefined, decrease: undefined } as GrouppedStatChanges;
		for (const stat of statTypes) {
			const value = this.get(stat);
			if (value > 0) {
				groups.increase = groups.increase ?? {};
				groups.increase[stat] = value;
			} else if (value < 0) {
				groups.decrease = groups.decrease ?? {};
				groups.decrease[stat] = -value;
			}
		}
		return groups;
	}
}
