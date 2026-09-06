import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const contents = await prisma.content.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { category: true }
  });
  console.log(JSON.stringify(contents, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
});
