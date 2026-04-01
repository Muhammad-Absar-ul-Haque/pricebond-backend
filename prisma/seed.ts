import { PrismaClient, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const pin = '123456';
  const hashedPin = await bcrypt.hash(pin, 10);

  const admins = [
    {
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin1@yopmail.com',
      mobile: '03001234567',
      address: 'Admin Street 1',
      city: 'Karachi',
      pin: hashedPin,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      otpVerified: true,
    },
    {
      firstName: 'Admin',
      lastName: 'Two',
      email: 'admin2@yopmail.com',
      mobile: '03007654321',
      address: 'Admin Street 2',
      city: 'Lahore',
      pin: hashedPin,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      otpVerified: true,
    },
  ];

  for (const adminData of admins) {
    const user = await prisma.user.upsert({
      where: { email: adminData.email },
      update: adminData,
      create: adminData,
    });
    console.log(`✅ Admin created/updated: ${user.email}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
