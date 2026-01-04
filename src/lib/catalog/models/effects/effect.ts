export abstract class Effect {}

export interface WoundEffect {
	wound: {
		target: 'self' | 'enemy' | 'allEnemies';
		amount: number;
	};
}

export interface ChangeCostEffect {
	changeCost: {
		strength?: number;
		agility?: number;
		intelligence?: number;
		charisma?: number;
	};
}
