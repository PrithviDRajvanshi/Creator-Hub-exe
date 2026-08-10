import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// If DATABASE_URL is not set, we'll use a default to the local prisma dev server just in case
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:51214/template1';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
