/**
 * One-time migration: moves the `name` from the `Character` table into the
 * latest `CharacterRevision.state` JSON for each character.
 *
 * The `name` column has been removed from the Prisma schema and is no longer
 * part of the `Character` model. This script reads the remaining column via
 * raw SQL and injects it into each character's latest revision state JSON.
 *
 * After running this migration and verifying the data, the `name` column can
 * be dropped manually:
 *
 *   ALTER TABLE "Character" DROP COLUMN "name";
 *
 * Usage:
 *   cd packages/web && npx tsx scripts/migrate-name-to-state.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is not set.');
	process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface CharacterRow {
	id: number;
	name: string;
}

async function main() {
	// 1. Read character names via raw SQL (column still exists in DB but is
	//    no longer mapped by Prisma).
	const rows = await prisma.$queryRawUnsafe<CharacterRow[]>('SELECT "id", "name" FROM "Character"');

	console.log(`Found ${rows.length} character(s).`);

	if (rows.length === 0) {
		console.log('Nothing to migrate.');
		return;
	}

	let updated = 0;
	let skipped = 0;

	for (const character of rows) {
		// 2. Find the latest revision for this character.
		const latestRevision = await prisma.characterRevision.findFirst({
			where: { characterId: character.id },
			orderBy: { number: 'desc' },
			select: { characterId: true, number: true, state: true }
		});

		if (!latestRevision) {
			console.log(`  Character #${character.id} ("${character.name}"): no revisions — skipping.`);
			skipped++;
			continue;
		}

		const state = latestRevision.state as Record<string, unknown>;

		// 3. Skip if the state JSON already has a non-empty name.
		if (typeof state.name === 'string' && state.name.length > 0) {
			console.log(
				`  Character #${character.id} ("${character.name}"): revision #${latestRevision.number} already has name — skipping.`
			);
			skipped++;
			continue;
		}

		// 4. Inject the name into the state JSON.
		const updatedState = { ...state, name: character.name };

		await prisma.characterRevision.update({
			where: {
				characterId_number: {
					characterId: character.id,
					number: latestRevision.number
				}
			},
			data: {
				state: updatedState
			}
		});

		console.log(
			`  Character #${character.id} ("${character.name}"): revision #${latestRevision.number} updated.`
		);
		updated++;
	}

	console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}.`);

	if (updated > 0) {
		console.log(
			'\nAll names have been migrated into revision state JSON.\n' +
				'You can now safely drop the "name" column from the "Character" table:\n\n' +
				'  ALTER TABLE "Character" DROP COLUMN "name";\n'
		);
	}

	await prisma.$disconnect();
}

main().catch(async (err) => {
	console.error('Migration failed:', err);
	await prisma.$disconnect();
	process.exit(1);
});
