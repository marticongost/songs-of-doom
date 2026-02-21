import { Character } from '$lib/models/characters';
import { User } from '$lib/models/user';
import { prisma } from '$lib/server/db';
import type { CharacterState } from '@songsofdoom/game';
import type { Prisma } from '../../../prisma/generated/prisma/client';

const CharacterFields = {
	owner: { select: { username: true, createdAt: true } },
	revisions: {
		orderBy: { number: 'desc' },
		take: 1
	}
} as const satisfies Prisma.CharacterInclude;

type CharacterRecord = Prisma.CharacterGetPayload<{ include: typeof CharacterFields }>;

/** Retrieves a character by its ID, or throws an error if it doesn't exist. */
export const getCharacterById = async (characterId: number): Promise<Character | undefined> => {
	const characterData = await prisma.character.findUnique({
		where: { id: characterId },
		include: CharacterFields
	});
	return characterData ? characterFromRecord(characterData) : undefined;
};

export const getCharacters = async (): Promise<Character[]> => {
	const characterData = await prisma.character.findMany({ include: CharacterFields });
	return characterData.map(characterFromRecord);
};

/** Transforms a {@link CharacterRecord} into a {@link Character} instance. */
export const characterFromRecord = (characterData: CharacterRecord): Character =>
	new Character({
		id: characterData.id,
		name: characterData.name,
		owner: new User(characterData.owner),
		revisions: characterData.revisions.map((revision) => ({
			number: revision.number,
			createdAt: revision.createdAt,
			finalised: revision.finalised,
			totalXp: revision.totalXp,
			state: revision.state as unknown as CharacterStateJson
		}))
	});

/** The JSON specification for the `CharacterRevision.state` database field. */
export interface CharacterStateJson {
	finalised: boolean;
	upgrades: Record<string, number>;
	skillsDeck: Record<string, number>;
	availableXp: number;
	gold: number;
}

/** Transforms a `Map` with objects that have an `id` property into a `Record`. */
const mapToRecord = <K extends { id: string }, V>(map: Map<K, V>): Record<string, V> =>
	Object.fromEntries([...map.entries()].map(([key, value]) => [key.id, value]));

/** Transforms a {@link CharacterState} model into a {@link CharacterStateJson} record. */
export const characterStateToJson = (state: CharacterState): CharacterStateJson => ({
	finalised: state.finalised,
	upgrades: mapToRecord(state.upgrades),
	skillsDeck: mapToRecord(state.skillsDeck),
	availableXp: state.availableXp,
	gold: state.gold
});
