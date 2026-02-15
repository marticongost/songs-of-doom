import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

async function main() {
	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
	const prisma = new PrismaClient({ adapter });

	try {
		// Get user IDs
		const users = await prisma.user.findMany({
			where: {
				username: { in: ['marticongost', 'jordiseira'] }
			}
		});

		const userMap = new Map(users.map((u) => [u.username, u.id]));

		if (!userMap.has('marticongost')) {
			console.error('Error: User "marticongost" not found. Create it first.');
			process.exit(1);
		}

		if (!userMap.has('jordiseira')) {
			console.error('Error: User "jordiseira" not found. Create it first.');
			process.exit(1);
		}

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
							state: {},
							totalXp: char.totalXp,
							spentXp: Math.floor(char.totalXp * 0.7),
							availableXp: Math.floor(char.totalXp * 0.3)
						}
					}
				}
			});

			console.log(`  Created: ${character.name} (owner: ${char.owner}, XP: ${char.totalXp})`);
		}

		console.log('Done!');
	} catch (error) {
		console.error('Error seeding characters:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
