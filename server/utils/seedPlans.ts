import prisma from '../config/prisma.js';

async function main() {
  const basicPlan = await prisma.plan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      price: 9.99,
      features: {
        create: [
          { description: '10 AI generations per month' },
          { description: 'Standard support' },
        ],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 29.99,
      features: {
        create: [
          { description: 'Unlimited AI generations' },
          { description: 'Priority support' },
          { description: 'Custom templates' },
        ],
      },
    },
  });

  console.log('Seeded plans:', { basicPlan, proPlan });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
