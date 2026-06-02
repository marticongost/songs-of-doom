import { Obligation, Opportunity, type Reaction } from '../capabilities/reaction';
import type { EventType } from '../event';
import type { GameGraph } from '../game/gamegraph';
import { Effect } from './effect';

/**
 * An effect that injects additional reactions into the currently active test.
 *
 * When applied, this effect appends the configured reactions to the active test
 * resolution's {@link TestResolution.additionalReactions} list. Those reactions
 * will then be considered by {@link GameGraph.collectReactiveCapabilities} for
 * the remainder of the test.
 *
 * Must be applied within an active test context (i.e. a test resolution must be
 * on the {@link GameState.testResolutionStack}). Throws if no test is active.
 */
export class TestReactionEffect extends Effect {
	readonly reaction: Reaction;

	constructor(reaction: Reaction) {
		super();
		this.reaction = reaction;
	}

	override async apply(gameGraph: GameGraph): Promise<void> {
		const currentCardId = gameGraph.current.state.requireCurrentCard().id;

		gameGraph.mutate((state) => {
			const resolution = state.requireActiveTestResolution();
			resolution.addReaction({ cardId: currentCardId, capability: this.reaction });
		});
	}
}

/**
 * Creates a {@link TestReactionEffect} that injects a mandatory reaction into the
 * active test. The given effect will be triggered automatically whenever the
 * specified event fires during test resolution.
 *
 * @param effect - The effect to wrap in an Obligation reaction.
 * @param event - The event that triggers the reaction. If omitted, the effect's
 *   {@link Effect.defaultEvent} is used. If neither is provided, an error is thrown.
 * @throws If neither `event` nor `effect.defaultEvent` is provided.
 */
export const testObligation = (effect: Effect, event?: EventType): TestReactionEffect => {
	const resolvedEvent = event ?? effect.defaultEvent;
	if (!resolvedEvent) {
		throw new Error(
			`Cannot attach effect of type ${effect.constructor.name} to a test without an explicit event trigger. ` +
				'Provide an event parameter or set a defaultEvent on the effect.'
		);
	}
	return new TestReactionEffect(
		new Obligation({ effects: [effect], triggers: [{ event: resolvedEvent }] })
	);
};

/**
 * Creates a {@link TestReactionEffect} that injects an optional reaction into the
 * active test. The player may choose to trigger the given effect when the specified
 * event fires during test resolution.
 *
 * @param effect - The effect to wrap in an Opportunity reaction.
 * @param event - The event that triggers the reaction. If omitted, the effect's
 *   {@link Effect.defaultEvent} is used. If neither is provided, an error is thrown.
 * @throws If neither `event` nor `effect.defaultEvent` is provided.
 */
export const testOpportunity = (effect: Effect, event?: EventType): TestReactionEffect => {
	const resolvedEvent = event ?? effect.defaultEvent;
	if (!resolvedEvent) {
		throw new Error(
			`Cannot attach effect of type ${effect.constructor.name} to a test without an explicit event trigger. ` +
				'Provide an event parameter or set a defaultEvent on the effect.'
		);
	}
	return new TestReactionEffect(
		new Opportunity({ effects: [effect], triggers: [{ event: resolvedEvent }] })
	);
};
