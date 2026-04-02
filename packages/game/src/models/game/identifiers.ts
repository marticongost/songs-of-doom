export type CardId = `c${number}`;
export type PlayerId = `p${number}`;
export type TargetId = CardId | PlayerId;

export const isCardId = (id: TargetId): id is CardId => id.startsWith('c');
export const isPlayerId = (id: TargetId): id is PlayerId => id.startsWith('p');
