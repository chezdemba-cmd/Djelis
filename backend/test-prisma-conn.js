const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  try {
    await prisma.$connect();
    console.log("Connected to Supabase successfully!");
    await prisma.$disconnect();
  } catch(e) {
    console.error("Prisma Connection Error:", e.message);
  }
}
main();
