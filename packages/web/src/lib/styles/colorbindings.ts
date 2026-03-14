import type { EntityTypeId, FocusType, StatType } from '@songsofdoom/game';
import { mapToRecord } from '../../../../common/src/utils';
import * as palette from './palette';
import type { HexColor } from './types';

export const clueColor = palette.pablo;
export const goldColor = palette.gold;
export const talentColor = palette.brandyPunch;
export const proficiencyColor = palette.brandyPunch;

export class ColorCoding<T extends string, C> {
	readonly colors: Record<T, C>;

	constructor(colors: Record<T, C>) {
		this.colors = colors;
	}

	get(type: T): C {
		return this.colors[type];
	}

	rules(
		attribute: string,
		properties: (color: C) => Record<string, string>
	): Record<string, Record<string, string>> {
		return mapToRecord(this.colors, {
			mapEntries: ([type, color]) => [`&[${attribute}='${type}']`, properties(color)]
		});
	}
}

export const stats = new ColorCoding<StatType, HexColor>({
	agility: palette.green,
	strength: palette.brown,
	intelligence: palette.brandyPunch,
	charisma: palette.oldGold,
	will: palette.violet,
	health: palette.red,
	sanity: palette.blue
});

export const focus = new ColorCoding<FocusType, HexColor>({
	...stats.colors,
	heroism: palette.blue,
	any: palette.somber
});

class CardBackground {
	readonly color1: HexColor;
	readonly color2: HexColor;

	constructor(color1: HexColor, color2: HexColor) {
		this.color1 = color1;
		this.color2 = color2;
	}

	get background(): string {
		return `linear-gradient(45deg, ${this.color1}, ${this.color2})`;
	}
}

export const cardBackgrounds = new ColorCoding<
	EntityTypeId,
	{ main: CardBackground; secondary: CardBackground }
>({
	archetype: {
		main: new CardBackground('#8b7b57', '#231603'),
		secondary: new CardBackground('#3b3229', '#090909')
	},
	trait: {
		main: new CardBackground('#5F5F69', '#141416'),
		secondary: new CardBackground('#1c1e21', '#1a1b1c')
	},
	skill: {
		main: new CardBackground('#47566b', '#110d16'),
		secondary: new CardBackground('#34343d', '#090909')
	},
	ally: {
		main: new CardBackground('#61476b', '#080808'),
		secondary: new CardBackground('#2b2731', '#090909')
	},
	item: {
		main: new CardBackground('#645044', '#1d0d02'),
		secondary: new CardBackground('#2e271a', '#090909')
	},
	creature: {
		main: new CardBackground('#98503f', '#1d0f02'),
		secondary: new CardBackground('#3f261c', '#090909')
	},
	encounter: {
		main: new CardBackground('#5d6860', '#080808'),
		secondary: new CardBackground('#202615', '#090909')
	},
	module: {
		main: new CardBackground('#111', '#000'),
		secondary: new CardBackground('#222', '#111')
	},
	discipline: {
		main: new CardBackground('#111', '#000'),
		secondary: new CardBackground('#222', '#111')
	},
	campaign: {
		main: new CardBackground('#111', '#000'),
		secondary: new CardBackground('#222', '#111')
	},
	scenario: {
		main: new CardBackground('#4a3d5c', '#0d0a14'),
		secondary: new CardBackground('#1e1a26', '#090909')
	},
	story: {
		main: new CardBackground('#4C4A42', '#0d0a02'),
		secondary: new CardBackground('#2a2210', '#090909')
	}
});
