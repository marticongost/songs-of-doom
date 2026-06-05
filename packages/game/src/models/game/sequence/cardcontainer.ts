import type { EntityTypeId } from '../../..';
import type { CardState } from '../cardstate';
import type { CardId } from '../identifiers';

export interface CardOptions {
	ready?: boolean;
	type?: EntityTypeId;
	includeAttachments?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CardContainer<TCard extends CardState<any> = CardState<any>> {
	getCard(id: CardId): TCard | undefined;
	requireCard(id: CardId): TCard;
	cards(options?: CardOptions): Array<TCard>;
}
