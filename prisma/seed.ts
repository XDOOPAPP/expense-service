import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding categories...');

  const categories = [
    { slug: 'food', name: 'Food & Dining' },
    { slug: 'transport', name: 'Transportation' },
    { slug: 'shopping', name: 'Shopping' },
    { slug: 'entertainment', name: 'Entertainment' },
    { slug: 'utilities', name: 'Utilities' },
    { slug: 'healthcare', name: 'Healthcare' },
    { slug: 'education', name: 'Education' },
    { slug: 'travel', name: 'Travel' },
    { slug: 'housing', name: 'Housing' },
    { slug: 'insurance', name: 'Insurance' },
    { slug: 'personal', name: 'Personal Care' },
    { slug: 'gifts', name: 'Gifts & Donations' },
    { slug: 'investments', name: 'Investments' },
    { slug: 'other', name: 'Other' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} categories`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
