const fs = require('fs');
let s = fs.readFileSync('backend/prisma/schema.prisma', 'utf8');

s = s.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
s = s.replace(/url\s*=\s*env\("DATABASE_URL"\)/, 'url = "file:./dev.db"');
s = s.replace(/directUrl\s*=\s*env\("DIRECT_URL"\)/, '');
s = s.replace(/@db\.[\w\(\),\s]+/g, '');
s = s.replace(/Decimal/g, 'Float');

const enums = [...s.matchAll(/enum\s+(\w+)\s+\{[\s\S]*?\}/g)];
enums.forEach(e => {
  s = s.replace(e[0], '');
  const enumName = e[1];
  s = s.replace(new RegExp(enumName + '(?=\\s|\\?)', 'g'), 'String');
});
s = s.replace(/@default\(([A-Z_]+)\)/g, '@default("$1")');

fs.writeFileSync('backend/prisma/schema.prisma', s);
console.log("Done");
