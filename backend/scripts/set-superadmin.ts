import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'chezdemba@gmail.com';
  console.log(`Setting up superadmin for: ${email}`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { profiles: true },
  });

  if (existingUser) {
    console.log(`User ${email} exists (ID: ${existingUser.id}, current role: ${existingUser.role}). Updating to SUPERADMIN...`);
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: UserRole.SUPERADMIN,
        isActive: true,
      },
    });

    if (existingUser.profiles.length === 0) {
      await prisma.profile.create({
        data: {
          userId: updated.id,
          name: 'Demba (Super Admin)',
        },
      });
      console.log('Created default profile for Demba.');
    }

    console.log(`User ${email} is now SUPERADMIN!`);
  } else {
    console.log(`User ${email} does not exist. Creating new SUPERADMIN user...`);
    const passwordHash = await bcrypt.hash('password123', 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.SUPERADMIN,
        isActive: true,
        profiles: {
          create: {
            name: 'Demba (Super Admin)',
          },
        },
      },
    });
    console.log(`Created user ${email} with ID: ${newUser.id} as SUPERADMIN (default password: password123).`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
