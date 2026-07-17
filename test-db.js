const { Client } = require('pg');

async function testConn(url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("SUCCESS for", url.split('@')[1] || url);
    await client.end();
  } catch(e) {
    console.error("FAIL for", url.split('@')[1] || url, e.message);
  }
}

async function main() {
  const urls = [
    "postgresql://postgres.osppgcecinamqbodbvpg:Djdjigui1%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
    "postgresql://postgres.osppgcecinamqbodbvpg:Djdjigui1@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
    "postgres://postgres:Djdjigui1%40@db.osppgcecinamqbodbvpg.supabase.co:6543/postgres?pgbouncer=true&sslmode=require",
    "postgres://postgres:Djdjigui1@db.osppgcecinamqbodbvpg.supabase.co:6543/postgres?pgbouncer=true&sslmode=require",
  ];
  for (let u of urls) {
     await testConn(u);
  }
}

main();
