import type { Locale } from '@songsofdoom/common';
import type { Entity } from '@songsofdoom/game';
import { getLocale } from './context/locale';
import type { Character } from './models/characters';

/** Gets the URL for a given entity.
 *
 * @param entity The entity to get the URL for.
 * @param locale An optional locale to include in the URL. If not provided, the current locale will be used.
 * @returns The URL for the given entity in the chosen locale.
 */
export const getEntityUrl = (entity: Entity | string, locale?: Locale): string => {
	return `/${locale ?? getLocale()}/cards/${typeof entity === 'string' ? entity : entity.variantId}`;
};

/** Gets the URL to create a new character.
 *
 * @param locale An optional locale to include in the URL. If not provided, the current locale will be used.
 * @returns The URL for creating a new character, in the chosen locale.
 */
export const getNewCharacterUrl = (locale?: Locale): string => {
	return `/${locale ?? getLocale()}/characters/new`;
};

/** Gets the URL for a given character.
 *
 * @param character The character to get the URL for.
 * @param locale An optional locale to include in the URL. If not provided, the current locale will be used.
 * @returns The URL for the given character in the chosen locale.
 */
export const getCharacterUrl = (character: Character | number, locale?: Locale): string => {
	return `/${locale ?? getLocale()}/characters/${typeof character === 'number' ? character : character.id}`;
};
