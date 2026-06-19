import { prisma } from '$lib/server/db';
import type { Prisma } from '../../../prisma/generated/prisma/client';

// ---------------------------------------------------------------------------
// Include clauses
// ---------------------------------------------------------------------------

const GameListFields = {
	owner: { select: { id: true, username: true } },
	participants: {
		select: {
			userId: true,
			character: { select: { id: true, name: true } }
		}
	}
} as const satisfies Prisma.GameInclude;

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type GameListRecord = Prisma.GameGetPayload<{ include: typeof GameListFields }>;

export interface GameListItem {
	id: string;
	status: string;
	campaignId: string | null;
	ownerId: string | null;
	ownerName: string | null;
	createdAt: Date;
	participants: Array<{
		userId: string;
		characterId: number;
		characterName: string;
	}>;
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

function toGameListItem(record: GameListRecord): GameListItem {
	return {
		id: record.id,
		status: record.status,
		campaignId: record.campaignId,
		ownerId: record.ownerId,
		ownerName: record.owner?.username ?? null,
		createdAt: record.createdAt,
		participants: record.participants.map((p) => ({
			userId: p.userId,
			characterId: p.character.id,
			characterName: p.character.name
		}))
	};
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Retrieves all games where the given user is a participant. */
export async function getUserGames(userId: string): Promise<GameListItem[]> {
	const records = await prisma.game.findMany({
		where: {
			participants: {
				some: { userId }
			}
		},
		include: GameListFields,
		orderBy: { updatedAt: 'desc' }
	});
	return records.map(toGameListItem);
}

/** Retrieves all games in PREPARATION state, ordered by creation date. */
export async function getOpenGames(): Promise<GameListItem[]> {
	const records = await prisma.game.findMany({
		where: { status: 'PREPARATION' },
		include: GameListFields,
		orderBy: { createdAt: 'desc' }
	});
	return records.map(toGameListItem);
}
