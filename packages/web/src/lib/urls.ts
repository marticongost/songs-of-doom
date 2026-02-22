import type { Locale } from '@songsofdoom/common';
import type { Entity } from '@songsofdoom/game';
import { getLocale } from './context/locale';

/** Gets the URL for a given entity.
 *
 * @param entity The entity to get the URL for.
 * @param locale An optional locale to include in the URL. If not provided, the current locale will be used.
 * @returns The URL for the given entity in the chosen locale.
 */
export const getEntityUrl = (entity: Entity, locale?: Locale): string => {
	return `/${locale ?? getLocale()}/cards/${entity.variantId}`;
};
