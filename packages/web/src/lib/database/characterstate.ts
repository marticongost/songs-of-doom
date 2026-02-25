import type { CharacterState } from '@songsofdoom/game';
import { mapToRecord } from '../../../../common/src/utils';

/** The JSON specification for the `CharacterRevision.state` database field. */
export interface CharacterStateJson {
	finalised: boolean;
	upgrades: Record<string, number>;
	skillsDeck: Record<string, number>;
	availableXp: number;
	gold: number;
}

/** Transforms a {@link CharacterState} model into a {@link CharacterStateJson} record. */
export const characterStateToJson = (state: CharacterState): CharacterStateJson => ({
	finalised: state.finalised,
	upgrades: mapToRecord(state.upgrades, { mapKeys: (entity) => entity.variantId }),
	skillsDeck: mapToRecord(state.skillsDeck, { mapKeys: (skill) => skill.variantId }),
	availableXp: state.availableXp,
	gold: state.gold
});
