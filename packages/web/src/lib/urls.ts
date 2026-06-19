import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Locale } from '@songsofdoom/common';
import type { Entity } from '@songsofdoom/game';
import { getLocale } from './context/locale';
import type { Character } from './models/characters';

/** A URL handler that provides both URL retrieval and navigation. */
export interface UrlHandler<TArgs extends unknown[]> {
	/** Returns the resolved URL for the given arguments. */
	get(...args: TArgs): string;
	/** Navigates to the URL for the given arguments. */
	go(...args: TArgs): void;
}

/** Creates a URL handler with a default go() implementation that calls get(). */
function createUrlHandler<TArgs extends unknown[]>(
	get: (...args: TArgs) => string
): UrlHandler<TArgs> {
	return {
		get,
		go(...args: TArgs): void {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- get() uses resolve()
			goto(this.get(...args));
		}
	};
}

/** URL handler for entity pages. */
export const entityUrl = createUrlHandler((entity: Entity | string, locale?: Locale) =>
	resolve('/[locale]/cards/[id]', {
		locale: locale ?? getLocale(),
		id: typeof entity === 'string' ? entity : entity.variantId
	})
);

/** URL handler for the new character page. */
export const newCharacterUrl = createUrlHandler((locale?: Locale) =>
	resolve('/[locale]/characters/new', { locale: locale ?? getLocale() })
);

/** URL handler for character pages. */
export const characterUrl = createUrlHandler((character: Character | number, locale?: Locale) =>
	resolve('/[locale]/characters/[id]', {
		locale: locale ?? getLocale(),
		id: String(typeof character === 'number' ? character : character.id)
	})
);

/** URL handler for character edit pages. */
export const editCharacterUrl = createUrlHandler((character: Character | number, locale?: Locale) =>
	resolve('/[locale]/characters/[id]/edit', {
		locale: locale ?? getLocale(),
		id: String(typeof character === 'number' ? character : character.id)
	})
);

/** URL handler for the new game page. */
export const newGameUrl = createUrlHandler((locale?: Locale) =>
	resolve('/[locale]/games/new', { locale: locale ?? getLocale() })
);

/** URL handler for the games list page. */
export const gamesUrl = createUrlHandler((locale?: Locale) =>
	resolve('/[locale]/games', { locale: locale ?? getLocale() })
);

/** URL handler for game pages. */
export const gameUrl = createUrlHandler((gameId: string, locale?: Locale) =>
	resolve('/[locale]/games/[gameId]', {
		locale: locale ?? getLocale(),
		gameId
	})
);
