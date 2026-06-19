import type { GameListItem } from '$lib/database/games';
import { getOpenGames, getUserGames } from '$lib/database/games';
import { translate, type Locale, type LocalisedText } from '@songsofdoom/common/localisation';
import { entities, isCampaign } from '@songsofdoom/game';
import type { PageServerLoad } from './$types';

/** A game list item with the campaign title resolved from the game catalog. */
export interface ResolvedGame {
	id: string;
	status: string;
	campaignTitle: LocalisedText | null;
	ownerName: string | null;
	participantCount: number;
	createdAt: Date;
}

function resolveGame(game: GameListItem): ResolvedGame {
	let campaignTitle: LocalisedText | null = null;
	if (game.campaignId) {
		const entity = entities.get(game.campaignId);
		if (entity && isCampaign(entity)) {
			campaignTitle = entity.title;
		}
	}

	return {
		id: game.id,
		status: game.status,
		campaignTitle,
		ownerName: game.ownerName,
		participantCount: game.participants.length,
		createdAt: game.createdAt
	};
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const locale = params.locale as Locale;
	const userId = locals.user?.id ?? null;

	const [userGames, allOpenGames] = await Promise.all([
		userId ? getUserGames(userId) : [],
		getOpenGames()
	]);

	// Exclude games the user is already participating in from open games.
	const myGameIds = new Set(userGames.map((g) => g.id));
	const openGames = allOpenGames.filter((g) => !myGameIds.has(g.id));

	return {
		title: translate({ ca: 'Partides', es: 'Partidas', en: 'Games' }, locale),
		myGames: userGames.map(resolveGame),
		openGames: openGames.map(resolveGame)
	};
};
