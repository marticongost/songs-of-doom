import { characterStateToJson } from '$lib/database/characters';
import { prisma } from '$lib/server/db';
import { CharacterState } from '@songsofdoom/game';

const fantasyNames = [
	'Thordak the Brave',
	'Elara Moonwhisper',
	'Grimjaw Ironhide',
	'Seraphina Dusk'
];

const characters = [
	{ name: fantasyNames[0], owner: 'marticongost', totalXp: 150 },
	{ name: fantasyNames[1], owner: 'marticongost', totalXp: 80 },
	{ name: fantasyNames[2], owner: 'jordiseira', totalXp: 200 },
	{ name: fantasyNames[3], owner: 'jordiseira', totalXp: 50 }
];

const initialState = characterStateToJson(CharacterState.initial()) as object;

async function main() {
	// Get user IDs
	const users = await prisma.user.findMany({
		where: {
			username: { in: ['marticongost', 'jordiseira'] }
		}
	});

	const userMap = new Map(users.map((u): [string, string] => [u.username, u.id]));

	if (!userMap.has('marticongost')) {
		console.error('Error: User "marticongost" not found. Create it first.');
		process.exit(1);
	}

	if (!userMap.has('jordiseira')) {
		console.error('Error: User "jordiseira" not found. Create it first.');
		process.exit(1);
	}

	console.log('Deleting existing characters...');
	await prisma.character.deleteMany();

	console.log('Creating characters...');

	for (const char of characters) {
		const ownerId = userMap.get(char.owner)!;

		const character = await prisma.character.create({
			data: {
				name: char.name,
				ownerId,
				revisions: {
					create: {
						number: 1,
						state: initialState,
						totalXp: char.totalXp,
						finalised: false
					}
				}
			}
		});

		console.log(`  Created: ${character.name} (owner: ${char.owner}, XP: ${char.totalXp})`);
	}

	console.log('Done!');
}

main();
