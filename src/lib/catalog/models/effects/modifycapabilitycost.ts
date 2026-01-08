import { attributeTypes, type AttributeType } from '../stats';
import { Effect, type EffectProps } from './effect';

export interface ModifyCapabilityCostEffectProps extends EffectProps {
	strength?: number;
	agility?: number;
	intelligence?: number;
	charisma?: number;
}

export interface GrouppedCapabilityCosts {
	increase?: Partial<Record<AttributeType, number>>;
	decrease?: Partial<Record<AttributeType, number>>;
}

export class ModifyCapabilityCostEffect extends Effect {
	readonly strength: number;
	readonly agility: number;
	readonly intelligence: number;
	readonly charisma: number;

	constructor({
		strength,
		agility,
		intelligence,
		charisma,
		properties
	}: ModifyCapabilityCostEffectProps) {
		super({ properties });
		this.strength = strength ?? 0;
		this.agility = agility ?? 0;
		this.intelligence = intelligence ?? 0;
		this.charisma = charisma ?? 0;
	}

	get(attribute: AttributeType): number {
		return this[attribute];
	}

	group(): GrouppedCapabilityCosts {
		const groups = { increase: undefined, decrease: undefined } as GrouppedCapabilityCosts;
		for (const attribute of attributeTypes) {
			const value = this.get(attribute);
			if (value > 0) {
				groups.increase = groups.increase ?? {};
				groups.increase[attribute] = value;
			} else if (value < 0) {
				groups.decrease = groups.decrease ?? {};
				groups.decrease[attribute] = -value;
			}
		}
		return groups;
	}
}
