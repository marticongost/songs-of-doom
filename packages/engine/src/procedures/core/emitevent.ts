import { type EventType, type Reaction, events, Obligation } from '@songsofdoom/game';
import { CapabilityField } from '../../core/input';
import { instructions } from '../../core/instructions';
import { type ProcedureState } from '../../core/procedure';
import { ProcedureId } from '../../core/procedureid';
import type { CapabilityRef, CardState } from '../../state/cardstate';
import type { GameContext } from '../../state/gamestate';
import type { ActorId, CardId, EntityId, PlayerId } from '../../state/identifiers';
import { triggerCapability } from './triggercapability';

export interface EventContext {
	/** Entity performing the triggering action. */
	actorId?: ActorId;

	/** Implicit subject for the current operation (for tests, usually attacker). */
	subjectId?: EntityId;

	/** Implicit target for the current operation (for tests, usually defender). */
	targetId?: EntityId;

	/** Currently active player, if any. */
	activePlayerId?: PlayerId;

	/** Card currently being evaluated or triggered as a reactor. */
	reactiveCardId?: CardId;

	/** Player owning the currently evaluated or triggered reactor. */
	reactivePlayerId?: PlayerId;
}

export interface EmitEventState extends ProcedureState {
	/** The type of event being emitted. */
	eventType: EventType;

	/** Contextual ids carried by the event (subject, target, etc.). */
	eventContext: Partial<EventContext>;

	/**
	 * Reaction groups ordered by priority, to be processed in sequence.
	 *
	 * Within each group, players get to choose execution order.
	 */
	reactionGroups?: Array<ReactionsGroup>;

	/** The reaction the player chose. Set in `askPlayersForNextReaction`. */
	chosenReaction?: CapabilityRef<Reaction> | null;
}

/**
 * Emits a game event and processes any reactions it triggers.
 */
const { define, input, call } = instructions<EmitEventState>();

export const emitEvent = define({
	id: ProcedureId.EmitEvent,
	steps: {
		init(state: EmitEventState) {
			const { game, eventContext, eventType } = state;
			const gameStateWithContext = eventContext
				? game.mutate((gameState) => gameState.pushContext(eventContext as GameContext))
				: game;
			const event = events[eventType];

			const allReactions = gameStateWithContext.cards({ ready: true }).flatMap((cardState) => {
				return cardState.getReactionsToEvent(event, gameStateWithContext).map((reaction) => ({
					cardState,
					reaction,
					playerId:
						cardState.playerId ?? gameStateWithContext.getActivePlayer()?.id ?? game.players[0].id
				}));
			});
			const playerOrder = gameStateWithContext.players.map((p) => p.id);

			return nextReactionState({
				...state,
				game: gameStateWithContext,
				reactionGroups: groupReactions(allReactions, playerOrder)
			});
		},
		askPlayersForNextReaction: input({
			fields: (state) => [
				new CapabilityField<Reaction, 'chosenReaction', boolean>({
					name: 'chosenReaction',
					choices: new Set(state.reactionGroups![0].reactions),
					required: state.reactionGroups![0].reactions.some(
						(capabilityRef) => capabilityRef.capability instanceof Obligation
					)
				})
			],
			then(state, inputs) {
				let reactionGroups = [...state.reactionGroups!];
				if (inputs.chosenReaction === null) {
					reactionGroups = reactionGroups.slice(1);
				} else {
					reactionGroups = popReaction(reactionGroups, inputs.chosenReaction);
				}
				return nextReactionState({ ...state, reactionGroups });
			}
		}),
		invokeReaction: call({
			procedure: triggerCapability,
			parameters: ({ chosenReaction, reactionGroups }) => ({
				capability: chosenReaction!.capability,
				cardId: chosenReaction!.cardId,
				actorId: reactionGroups![0].playerId
			}),
			then: (state, _result) => {
				// Pop the consumed reaction — it may have been auto-selected by
				// nextReactionState (for mandatory reactions), which skips
				// askPlayersForNextReaction where popReaction normally lives.
				let reactionGroups = state.reactionGroups!;
				if (state.chosenReaction) {
					reactionGroups = popReaction(reactionGroups, state.chosenReaction);
				}
				return {
					...state,
					step: reactionGroups.length ? 'askPlayersForNextReaction' : 'finalise',
					reactionGroups,
					chosenReaction: undefined
				};
			}
		}),
		finalise(state: EmitEventState) {
			const { eventContext } = state;
			return {
				...state,
				status: 'complete',
				game: eventContext
					? state.game.mutate((gameState) => gameState.popContext(eventContext))
					: state.game
			};
		}
	}
});

const nextReactionState = (state: EmitEventState): EmitEventState => {
	const reactionGroups = state.reactionGroups;
	if (!reactionGroups?.length) {
		return {
			...state,
			step: 'finalise',
			reactionGroups: undefined,
			chosenReaction: undefined
		};
	} else if (
		reactionGroups[0].reactions.length === 1 &&
		reactionGroups[0].reactions[0].capability.mandatory
	) {
		return {
			...state,
			step: 'invokeReaction',
			chosenReaction: reactionGroups[0].reactions[0]
		};
	}
	return {
		...state,
		step: 'askPlayersForNextReaction',
		chosenReaction: undefined
	};
};

const popReaction = (
	reactionGroups: Array<ReactionsGroup>,
	capabilityRef: CapabilityRef<Reaction>
): Array<ReactionsGroup> => {
	const [currentGroup, ...remainingGroups] = reactionGroups;
	currentGroup.reactions = currentGroup.reactions.filter(
		(ref) => ref.capability !== capabilityRef.capability || ref.cardId !== capabilityRef.cardId
	);
	return [...(currentGroup.reactions.length ? [currentGroup] : []), ...remainingGroups];
};

interface ReactionRef {
	reaction: Reaction;
	cardState: CardState;
	playerId: PlayerId;
}

interface ReactionsGroup {
	reactions: Array<CapabilityRef<Reaction>>;
	playerId: PlayerId;
}

export const groupReactions = (
	reactions: Array<ReactionRef>,
	playerOrder: Array<PlayerId>
): Array<ReactionsGroup> => {
	const sortedReactions = [...reactions];
	sortedReactions.sort((a, b) => {
		return (
			a.cardState.card.reactionOrder - b.cardState.card.reactionOrder ||
			playerOrder.indexOf(a.playerId) - playerOrder.indexOf(b.playerId)
		);
	});
	const groups: Array<ReactionsGroup> = [];
	let currentPlayerId: PlayerId | undefined;
	let currentReactionOrder: number | undefined;
	for (const reaction of sortedReactions) {
		const capabilityRef = {
			cardId: reaction.cardState.id,
			capability: reaction.reaction
		};
		if (
			reaction.cardState.card.reactionOrder !== currentReactionOrder ||
			reaction.playerId !== currentPlayerId
		) {
			groups.push({
				reactions: [capabilityRef],
				playerId: reaction.playerId
			});
			currentReactionOrder = reaction.cardState.card.reactionOrder;
			currentPlayerId = reaction.playerId;
		} else {
			groups[groups.length - 1].reactions.push(capabilityRef);
		}
	}
	return groups;
};
