export type EventType =
	| 'attacking'
	| 'defending'
	| 'enemyDefeated'
	| 'payingCapability'
	| 'acquired';

export type EventProps = EventType | { type: EventType };

export class Event {
	readonly type: EventType;

	constructor(props: EventProps) {
		this.type = typeof props === 'string' ? props : props.type;
	}
}
