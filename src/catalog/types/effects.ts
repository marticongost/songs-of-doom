export type Effect = OneOfEffect | SequenceEffect | DrawEffect | WoundEffect | ChangeCostEffect;

export interface OneOfEffect {
	oneOf: Array<Effect>;
}

export interface SequenceEffect {
	sequence: Array<Effect>;
}

export interface DrawEffect {
	draw: {
		count: number;
	};
}

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
