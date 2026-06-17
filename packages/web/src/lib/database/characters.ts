import { Character } from '$lib/models/characters';
import { User } from '$lib/models/user';
import { prisma } from '$lib/server/db';
import type { CharacterState, CharacterStateProps } from '@songsofdoom/game';
import type { Prisma } from '../../../prisma/generated/prisma/client';
import { characterStateToJson, type CharacterStateJson } from './characterstate';
import { withOptimisticConcurrencyRetry } from './optimistic-concurrency';

export { characterStateToJson, type CharacterStateJson } from './characterstate';

const CharacterFields = {
	owner: { select: { id: true, username: true, createdAt: true } },
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

/** Retrieves all characters with their owner and latest revision. */
export const getCharacters = async (): Promise<Character[]> => {
	const characterData = await prisma.character.findMany({ include: CharacterFields });
	return characterData.map(characterFromRecord);
};

/** Retrieves all characters owned by a specific user, with owner and latest revision. */
export const getCharactersByOwner = async (userId: string): Promise<Character[]> => {
	const characterData = await prisma.character.findMany({
		where: { ownerId: userId },
		include: CharacterFields
	});
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
			state: {
				...(revision.state as unknown as CharacterStateJson),
				totalXp: revision.totalXp
			} as CharacterStateProps
		}))
	});

/**
 * Creates a new revision for a character, saving the current state.
 * @param characterId - The ID of the character to update
 * @param state - The new CharacterState to save
 * @returns The new revision number
 */
export const createCharacterRevision = async (
	characterId: number,
	state: CharacterState
): Promise<{ revisionNumber: number }> => {
	const stateJson = characterStateToJson(state);

	return withOptimisticConcurrencyRetry(async () =>
		prisma.$transaction(async (tx) => {
			const currentRevision = await tx.characterRevision.findFirst({
				where: { characterId },
				orderBy: { number: 'desc' },
				select: { number: true, totalXp: true }
			});

			const newRevisionNumber = (currentRevision?.number ?? 0) + 1;

			await tx.characterRevision.create({
				data: {
					characterId,
					number: newRevisionNumber,
					state: stateJson as object,
					totalXp: currentRevision?.totalXp ?? 0,
					finalised: state.finalised
				}
			});

			return { revisionNumber: newRevisionNumber };
		})
	);
};
