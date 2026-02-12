import { PrismaClient } from '../../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '$env/static/private';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
	const adapter = new PrismaPg({ connectionString: DATABASE_URL });
	return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
