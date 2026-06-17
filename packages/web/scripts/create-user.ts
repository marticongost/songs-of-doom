import { hash } from '@node-rs/argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';

const ARGON2_OPTIONS = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
};

function generateUserId(): string {
	const bytes = new Uint8Array(15);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function promptPassword(): Promise<string> {
	if (!process.stdin.isTTY) {
		throw new Error('stdin is not a TTY — pass the password as a CLI argument instead');
	}

	const stdin = process.stdin;
	const wasRaw = stdin.isRaw;
	stdin.setRawMode(true);
	process.stdout.write('Password: ');

	let password = '';

	for await (const chunk of stdin) {
		// Decode as UTF-8 — the terminal sends complete multi-byte sequences in one chunk
		const text = chunk.toString('utf8');
		for (const char of text) {
			// Enter (CR or LF)
			if (char === '\r' || char === '\n') {
				stdin.setRawMode(wasRaw);
				process.stdout.write('\n');
				return password;
			}
			// Ctrl+C (sends 0x03 in raw mode)
			if (char === '\x03') {
				stdin.setRawMode(wasRaw);
				process.stdout.write('\n');
				process.exit(1);
			}
			// Backspace / DEL
			if (char === '\x7f' || char === '\x08') {
				if (password.length > 0) {
					password = password.slice(0, -1);
				}
				continue;
			}
			password += char;
		}
	}

	// Unreachable under normal use
	stdin.setRawMode(wasRaw);
	return password;
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length < 1 || args.length > 2) {
		console.error('Usage: npx tsx scripts/create-user.ts <username> [password]');
		console.error('');
		console.error('Creates a new user with the given username and password.');
		console.error('If password is not provided, you will be prompted for it.');
		console.error('');
		console.error('Arguments:');
		console.error('  username    3-31 characters, alphanumeric, hyphens, and underscores');
		console.error('  password    6-255 characters (optional, will prompt if omitted)');
		process.exit(1);
	}

	const username = args[0];
	const password = args[1] ?? (await promptPassword());

	// Validate username
	if (username.length < 3 || username.length > 31) {
		console.error('Error: Username must be between 3 and 31 characters');
		process.exit(1);
	}

	if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		console.error('Error: Username can only contain letters, numbers, hyphens, and underscores');
		process.exit(1);
	}

	// Validate password
	if (password.length < 6 || password.length > 255) {
		console.error('Error: Password must be between 6 and 255 characters');
		process.exit(1);
	}

	const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
	const prisma = new PrismaClient({ adapter });

	try {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { username: username.toLowerCase() }
		});

		if (existingUser) {
			console.error(`Error: User "${username}" already exists`);
			process.exit(1);
		}

		// Create user
		const userId = generateUserId();
		const hashedPassword = await hash(password, ARGON2_OPTIONS);

		const user = await prisma.user.create({
			data: {
				id: userId,
				username: username.toLowerCase(),
				password: hashedPassword
			}
		});

		console.log(`User created successfully:`);
		console.log(`  ID: ${user.id}`);
		console.log(`  Username: ${user.username}`);
		console.log(`  Created at: ${user.createdAt.toISOString()}`);
	} catch (error) {
		console.error('Error creating user:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
