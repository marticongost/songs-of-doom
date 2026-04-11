export type CardId = `c${number}`;
export type PlayerId = `p${number}`;
export type EntityId = CardId | PlayerId;

export const isCardId = (id: EntityId): id is CardId => id.startsWith('c');
export const isPlayerId = (id: EntityId): id is PlayerId => id.startsWith('p');
