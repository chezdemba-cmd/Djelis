import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  { name: "Pass Jour", durationDays: 1, priceFcfa: 150, priceEuro: 0.25 },
  {
    name: "Pass Week-end",
    durationDays: 3,
    priceFcfa: 350,
    priceEuro: 0.5,
  },
  { name: "Pass Mois", durationDays: 30, priceFcfa: 2000, priceEuro: 4.99 },
];

async function upsertPlan(plan: (typeof plans)[number]) {
  const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
  if (existing) {
    return prisma.plan.update({ where: { id: existing.id }, data: plan });
  }
  return prisma.plan.create({ data: plan });
}

async function main() {
  const video = await prisma.category.upsert({
    where: { slug: "djaasoo" },
    update: { name: "DjaaSoo (Vidéo)", isActive: true },
    create: { name: "DjaaSoo (Vidéo)", slug: "djaasoo" },
  });
  const audio = await prisma.category.upsert({
    where: { slug: "djelison" },
    update: { name: "DjeliSon (Audio)", isActive: true },
    create: { name: "DjeliSon (Audio)", slug: "djelison" },
  });

  await Promise.all([
    prisma.genre.upsert({
      where: { categoryId_name: { categoryId: video.id, name: "Cinéma" } },
      update: { slug: "cinema" },
      create: { categoryId: video.id, name: "Cinéma", slug: "cinema" },
    }),
    prisma.genre.upsert({
      where: { categoryId_name: { categoryId: video.id, name: "Séries" } },
      update: { slug: "series" },
      create: { categoryId: video.id, name: "Séries", slug: "series" },
    }),
    prisma.genre.upsert({
      where: { categoryId_name: { categoryId: audio.id, name: "Musique" } },
      update: { slug: "musique" },
      create: { categoryId: audio.id, name: "Musique", slug: "musique" },
    }),
    prisma.genre.upsert({
      where: { categoryId_name: { categoryId: audio.id, name: "Podcasts" } },
      update: { slug: "podcasts" },
      create: { categoryId: audio.id, name: "Podcasts", slug: "podcasts" },
    }),
    ...plans.map(upsertPlan),
  ]);

  console.log("Production reference data initialized.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
