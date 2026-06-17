import { entities, isScenario } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { ReadonlyCardState } from '../../../state/cardstate';
import type { CardId } from '../../../state/identifiers';
import { chapter } from '../chapters/chapter';

export interface RunScenarioState extends ProcedureState {
	/** The qualified id of the scenario being started. */
	scenarioId: string;
}

const { define, emitEvent, call } = instructions<RunScenarioState>();

/**
 * Starts a scenario — resolves it from the catalog, sets it on the
 * game state and emits the {@link EventType#scenarioStart} event to
 * trigger scenario obligations.
 */
export const runScenario = define({
	id: ProcedureId.RunScenario,
	steps: {
		init: (state) => {
			const scenario = entities.require(state.scenarioId);
			if (!isScenario(scenario)) {
				throw new Error(`Scenario "${state.scenarioId}" not found`);
			}
			return {
				...state,
				game: state.game.mutate((mutable) => {
					const scenarioCard = new ReadonlyCardState({
						id: scenario.id as CardId,
						card: scenario
					});
					mutable.scenario = scenarioCard.mutable();
					mutable.chapter = 0;
					mutable.turn = 0;
				})
			};
		},
		emit: emitEvent({ eventType: 'scenarioStart' }),
		beginPlay: call(chapter, {})
	}
});
