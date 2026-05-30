import { Action } from '../capabilities/action';
import { drawCards } from '../effects/drawcards';
import { drawFocus } from '../effects/drawfocuseffect';
import { chooseEnemyAction } from './enemyactions';
import type { GameGraph } from './gamegraph';
import { ChapterPhaseNode, PlayerFocusNode, TurnPhaseNode } from './gamenodes';
import { type CardId } from './identifiers';
import { CapabilityChoiceField, FocusesField } from './playerinput';

export interface PlannedAction {
	readonly cardId: CardId;
	readonly action: Action;
	readonly initiative: number;
}

/**
 * Runs a full game chapter (phases C0–C5).
 * Entry point: call `gameGraph.runChapter()` which delegates here.
 */
export async function runChapter(gameGraph: GameGraph): Promise<void> {
	await gameGraph.group(ChapterPhaseNode, { phase: 'chapter-start' }, {}, async () => {
		await gameGraph.triggerEvent('chapterStart');
	});
	await gameGraph.group(ChapterPhaseNode, { phase: 'focus' }, {}, async () => {
		await runFocusPhase(gameGraph);
	});
	await gameGraph.group(ChapterPhaseNode, { phase: 'turns' }, {}, async () => {
		await runTurnsPhase(gameGraph);
	});
	await gameGraph.group(ChapterPhaseNode, { phase: 'draw' }, {}, async () => {
		await runDrawPhase(gameGraph);
	});
	await gameGraph.group(ChapterPhaseNode, { phase: 'encounters' }, {}, async () => {});
	await gameGraph.group(ChapterPhaseNode, { phase: 'cleanup' }, {}, async () => {
		await gameGraph.triggerEvent('chapterEnd');
	});
}

/**
 * C1 — Focus phase.
 * Each player trims their focus hand to their concentration, then draws 5 focus tokens.
 */
export async function runFocusPhase(gameGraph: GameGraph): Promise<void> {
	for (const player of gameGraph.current.state.players) {
		if (player.defeated) continue;
		gameGraph.group(PlayerFocusNode, {}, { activePlayerId: player.id }, async () => {
			await trimToConcentration(gameGraph);
			await gameGraph.triggerEffect(drawFocus(5));
		});
	}
}

/**
 * Trims a player's focus hand down to their concentration value.
 *
 * If the hand already holds at most `concentration` tokens this is a no-op.
 * Otherwise the player is prompted to select which tokens to keep; any
 * excess are moved to the discard pile.
 */
export async function trimToConcentration(gameGraph: GameGraph): Promise<void> {
	const player = gameGraph.current.state.requireActivePlayer();
	const hand = player.focusesHand;
	const concentration = gameGraph.current.state.getConcentration(player.id);
	if (hand.totalCount() <= concentration) return;

	const { selection } = await gameGraph.requestInput(
		[
			new FocusesField({
				name: 'selection',
				focuses: hand,
				maxTotalTokens: concentration,
				required: true
			})
		],
		{ playerId: player.id }
	);

	gameGraph.mutate((state) => {
		const mutablePlayer = state.requirePlayer(player.id);
		for (const [token, currentCount] of hand.entries()) {
			const keep = selection?.get(token) ?? 0;
			const discard = currentCount - keep;
			if (discard > 0) {
				mutablePlayer.focusesHand.remove(token, discard);
				mutablePlayer.focusesDiscardPile.add(token, discard);
			}
		}
	});
}

/**
 * C4 — Draw phase.
 * Each non-defeated player draws 1 card.
 */
export async function runDrawPhase(gameGraph: GameGraph): Promise<void> {
	for (const player of gameGraph.current.state.players) {
		if (player.defeated) continue;
		await gameGraph.triggerEffect(drawCards(1), { activePlayerId: player.id });
	}
}

/**
 * C2 — Turns phase.
 * Runs turns in a loop until no entity acts.
 */
export async function runTurnsPhase(
	gameGraph: GameGraph,
	singleTurnRunner: (graph: GameGraph) => Promise<boolean> = runTurn
): Promise<void> {
	let acted: boolean;
	do {
		acted = await singleTurnRunner(gameGraph);
	} while (acted);
}

/**
 * Runs a single turn (T0–T3).
 * Returns true if at least one entity acted (i.e. plannedActions was non-empty).
 */
export async function runTurn(gameGraph: GameGraph): Promise<boolean> {
	await gameGraph.group(TurnPhaseNode, { phase: 'turn-start' }, {}, async () => {
		await gameGraph.triggerEvent('turnStart');
	});
	await gameGraph.group(TurnPhaseNode, { phase: 'enemy-planning' }, {}, async () => {
		await runEnemyPlanning(gameGraph);
	});
	const acted = gameGraph.current.state.plannedActions.size > 0;
	await gameGraph.group(TurnPhaseNode, { phase: 'execution' }, {}, async () => {
		await runExecution(gameGraph);
	});
	await gameGraph.group(TurnPhaseNode, { phase: 'turn-end' }, {}, async () => {
		await gameGraph.triggerEvent('turnEnd');
	});
	return acted;
}

/**
 * T1a — Enemy planning.
 * For each enemy in play, selects their action and records it in plannedActions.
 */
export async function runEnemyPlanning(gameGraph: GameGraph): Promise<void> {
	const state = gameGraph.current.state;
	for (const creature of state.cards({ type: 'creature' })) {
		const chosen = chooseEnemyAction(state, creature.id as CardId);
		if (chosen !== undefined) {
			gameGraph.mutate((s) => {
				s.plannedActions.set(creature.id, chosen);
			});
		}
	}
}

/**
 * T1b — Player planning.
 * For each non-defeated player (and their allies), requests an action choice and records
 * it in plannedActions.
 */
export async function runPlayerPlanning(gameGraph: GameGraph): Promise<void> {
	for (const player of gameGraph.current.state.players) {
		if (player.defeated) continue;
		const { action } = await gameGraph.requestInput(
			[new CapabilityChoiceField({ name: 'action', choices: new Set(), required: false })] as const,
			{ playerId: player.id }
		);
		if (action !== undefined && action.capability instanceof Action) {
			const initiative = gameGraph.current.state.calculateInitiative(
				player.id,
				action.capability as Action
			);
			gameGraph.mutate((s) => {
				s.plannedActions.set(action.cardId, {
					cardId: action.cardId,
					action: action.capability as Action,
					initiative
				});
			});
		}
	}
}

/**
 * T2 — Execution.
 * Sorts plannedActions by initiative (descending), triggers each action, then clears
 * plannedActions from game state.
 */
export async function runExecution(gameGraph: GameGraph): Promise<void> {
	const sortedActions = Array.from(gameGraph.current.state.plannedActions.values()).sort(
		(a, b) => b.initiative - a.initiative
	);
	for (const { cardId, action } of sortedActions) {
		const card = gameGraph.current.state.getCard(cardId);
		const playerId = card?.getPlayerId();
		await action.trigger({ gameGraph, cardId, context: { activePlayerId: playerId } });
	}
	gameGraph.mutate((s) => s.plannedActions.clear());
}
