import { shuffle } from '@songsofdoom/common';
import type { GameGraph } from '../gamegraph';
import { ChapterPhaseNode, PlayerEncounterNode } from '../gamenodes';
import type { CardId, EntityId } from '../identifiers';

export const runEncounterPhase = async (gameGraph: GameGraph): Promise<void> => {
	await gameGraph.group(ChapterPhaseNode, { phase: 'encounters' }, {}, async () => {
		for (const player of gameGraph.current.state.players) {
			if (player.defeated) continue;
			await dealEncounterCard(gameGraph, player.id);
		}
	});
};

export const dealEncounterCard = async (
	gameGraph: GameGraph,
	playerId: EntityId
): Promise<void> => {
	await gameGraph.group(PlayerEncounterNode, { playerId }, {}, async () => {
		let encounterCardId: CardId | undefined;
		gameGraph.mutate((state) => {
			const player = state.requirePlayer(playerId);
			let encounterCard = state.encounterDeck.shift();
			if (!encounterCard) {
				state.encounterDeck = [...state.encounterDiscardPile];
				shuffle(state.encounterDiscardPile);
				state.encounterDeck = state.encounterDiscardPile;
				state.encounterDiscardPile = [];
				encounterCard = state.encounterDeck.shift();
				state.encounterDeck.forEach((card) => (card.container = { type: 'encounter-deck' }));
			}
			if (encounterCard) {
				encounterCard.container = { type: 'player', playerId };
				player.stage.push(encounterCard);
				encounterCardId = encounterCard.id;
			}
		});
		if (encounterCardId) {
			await gameGraph.triggerEvent('encounterRevealed', {
				subjectId: encounterCardId,
				targetId: playerId
			});
		}
	});
};
