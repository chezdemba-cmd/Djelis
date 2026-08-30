const { Client } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

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
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must be defined in backend/.env');
  }
  await testConn(url);
}

main();
