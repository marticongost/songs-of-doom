import type { LocalisedText } from '@songsofdoom/common/localisation';
import { ParentEntity } from './entity';
import { campaign } from '../properties/entitytypes';

export interface CampaignProps {
	title: LocalisedText;
}

export class Campaign extends ParentEntity {
	override readonly type = campaign;

	constructor({ title }: CampaignProps) {
		super({ title });
	}
}
