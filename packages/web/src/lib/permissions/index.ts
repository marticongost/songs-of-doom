import type { Character } from '$lib/models/characters';
import type { SessionUser } from '$lib/server/auth';

/**
 * Checks if the given user can edit the character.
 * Only the owner of a character can edit it.
 */
export const canEditCharacter = (character: Character, user: SessionUser | null): boolean => {
	return user !== null && character.owner.id === user.id;
};
