import { CharacterState, type CharacterStateProps } from '@songsofdoom/game';
import { mapToRecord } from '../../../../common/src/utils';

/** The JSON specification for the `CharacterRevision.state` database field. */
export interface CharacterStateJson {
	name: string;
	finalised: boolean;
	upgrades: Record<string, number>;
	skillsDeck: Record<string, number>;
	gold: number;
	portrait: number;
}

/** Transforms a {@link CharacterState} model into a {@link CharacterStateJson} record. */
export const characterStateToJson = (state: CharacterState): CharacterStateJson => ({
	name: state.name,
	finalised: state.finalised,
	upgrades: mapToRecord(state.upgrades, { mapKeys: (entity) => entity.variantId }),
	skillsDeck: mapToRecord(state.skillsDeck, { mapKeys: (skill) => skill.variantId }),
	gold: state.gold,
	portrait: state.portrait
});

/**
 * Reconstructs a {@link CharacterState} from a raw Prisma revision row.
 *
 * The `state` field is the JSON stored in `CharacterRevision.state`;
 * `totalXp` is stored as a separate column.
 */
export const characterStateFromRevision = (revision: {
	state: unknown;
	totalXp: number;
}): CharacterState => {
	const state = revision.state as CharacterStateJson;
	return new CharacterState({
		...state,
		name: state.name ?? '',
		totalXp: revision.totalXp
	} as CharacterStateProps);
};
