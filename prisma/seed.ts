import { PrismaClient } from '@prisma/client';
import { DISCUSSION_LOCATIONS, ADMIN_EMAIL } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create discussion locations
  console.log('Creating discussion locations...');
  for (const location of DISCUSSION_LOCATIONS) {
    await prisma.location.upsert({
      where: { slug: location.slug },
      update: {
        name: location.name,
      },
      create: {
        id: location.id,
        name: location.name,
        slug: location.slug,
        address: 'TBD',
        city: 'TBD',
        state: 'TX',
        zip: '00000',
        isActive: true,
      },
    });
    console.log(`  ✓ ${location.name}`);
  }

  // Create admin user if not exists
  console.log('Creating admin user...');
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash: '', // Clerk handles auth
      role: 'admin',
    },
  });
  console.log(`  ✓ Admin user (${ADMIN_EMAIL})`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
