import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Using the same config as the app to ensure consistency
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:51214/template1';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Clean up existing plans (which cascades to PlanFeature)
  await prisma.plan.deleteMany({});
  
  // Create Basic Plan
  await prisma.plan.create({
    data: {
      name: 'Basic',
      price: 9.99,
      features: {
        create: [
          { description: 'Access to basic AI tools' },
          { description: 'Standard support' }
        ]
      }
    }
  });

  // Create Pro Plan
  await prisma.plan.create({
    data: {
      name: 'Pro',
      price: 29.99,
      features: {
        create: [
          { description: 'Access to advanced AI tools' },
          { description: 'Priority support' },
          { description: 'Unlimited generations' }
        ]
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
