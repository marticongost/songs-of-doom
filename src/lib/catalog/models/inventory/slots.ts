import type { LocalisedText } from '$lib/localisation';

export type SlotType = 'hand' | 'twoHands' | 'boots' | 'gloves' | 'head' | 'chest' | 'amulet';

export interface SlotProps {
	type: SlotType;
	title: LocalisedText;
}

export class Slot {
	readonly type: SlotType;
	readonly title: LocalisedText;

	constructor(props: SlotProps) {
		this.type = props.type;
		this.title = props.title;
	}
}

export const slots: Record<SlotType, Slot> = {
	hand: new Slot({ type: 'hand', title: { ca: 'Mà', es: 'Mano', en: 'Hand' } }),
	twoHands: new Slot({
		type: 'twoHands',
		title: { ca: 'Dues mans', es: 'Dos manos', en: 'Two Hands' }
	}),
	boots: new Slot({ type: 'boots', title: { ca: 'Botes', es: 'Botas', en: 'Boots' } }),
	gloves: new Slot({ type: 'gloves', title: { ca: 'Guants', es: 'Guantes', en: 'Gloves' } }),
	head: new Slot({ type: 'head', title: { ca: 'Cap', es: 'Cabeza', en: 'Head' } }),
	chest: new Slot({ type: 'chest', title: { ca: 'Pit', es: 'Pecho', en: 'Chest' } }),
	amulet: new Slot({ type: 'amulet', title: { ca: 'Amulet', es: 'Amuleto', en: 'Amulet' } })
};
