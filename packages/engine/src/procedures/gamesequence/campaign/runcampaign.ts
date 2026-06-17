import { Counter } from '@songsofdoom/common';
import type { CharacterState } from '@songsofdoom/game';
import { entities, isCampaign } from '@songsofdoom/game';
import { instructions } from '../../../core/instructions';
import { type ProcedureState } from '../../../core/procedure';
import { ProcedureId } from '../../../core/procedureid';
import { ReadonlyGameState } from '../../../state/gamestate';
import { ReadonlyPlayerState } from '../../../state/playerstate';
import { runScenario } from '../scenarios/runscenario';

export interface RunCampaignState extends ProcedureState {
	/** The id of the campaign to initialise from. */
	campaignId?: string;

	/** Character states used to create player states, one per participant. */
	characters?: CharacterState[];

	/** The id of the scenario to play next. */
	scenarioId?: string;
}

const { define, call } = instructions<RunCampaignState>();

/**
 * Builds the initial {@link ReadonlyGameState} from participants'
 * character states, resolves the campaign's initial scenario,
 * starts each subsequent scenario, and ends once there are no
 * more scenarios to play.
 */
export const runCampaign = define({
	id: ProcedureId.RunCampaign,
	steps: {
		init: (state) => {
			const campaign = entities.require(state.campaignId!);
			if (!isCampaign(campaign)) {
				throw new Error(`Invalid campaign id: ${state.campaignId}`);
			}

			if (!state.characters || state.characters.length === 0) {
				throw new Error('At least one character is required to start a campaign');
			}

			const players = state.characters.map((character, i) => {
				return new ReadonlyPlayerState({
					id: `plr${i + 1}` as `plr${number}`,
					character: character ?? ({} as CharacterState),
					deck: [],
					hand: [],
					discardPile: [],
					focusesBag: new Counter(),
					focusesDiscardPile: new Counter(),
					focusesHand: new Counter(),
					physicalTrauma: 0,
					mentalTrauma: 0
				});
			});

			const game = new ReadonlyGameState({
				players,
				encounterDeck: [],
				encounterDiscardPile: []
			});

			return {
				...state,
				step: 'scenario',
				scenarioId: getCampaignScenarioId(state.campaignId!, campaign.initialScenarioId),
				game
			};
		},
		scenario: call(
			runScenario,
			({ scenarioId }) => ({ scenarioId }),
			(state, scenarioResult) => {
				const nextScenarioId = scenarioResult.game.nextScenarioId;
				if (nextScenarioId) {
					return {
						...state,
						step: 'scenario',
						scenarioId: getCampaignScenarioId(state.campaignId!, nextScenarioId)
					};
				} else {
					return {
						...state,
						step: undefined,
						status: 'complete'
					};
				}
			}
		)
	}
});

const getCampaignScenarioId = (campaignId: string, scenarioId: string) =>
	`${campaignId}-${scenarioId}`;
