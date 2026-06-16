import type { LocalisedText } from '@songsofdoom/common/localisation';
import { campaign } from '../properties/entitytypes';
import { ParentEntity } from './entity';

export interface CampaignProps {
	title: LocalisedText;

	/** The id of the scenario to start with, scoped to this campaign (e.g. "sc1" resolves to "SoHH-sc1"). */
	initialScenarioId: string;
}

export class Campaign extends ParentEntity {
	override readonly type = campaign;

	/** The id of the scenario to start with, scoped to this campaign. */
	readonly initialScenarioId: string;

	constructor({ title, initialScenarioId }: CampaignProps) {
		super({ title });
		this.initialScenarioId = initialScenarioId;
	}
}
