const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.osppgcecinamqbodbvpg:Djdjigui2016@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
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
