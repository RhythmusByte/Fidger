const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Usage: node scripts/hashPassword.js \"yourPassword\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(plainPassword, 10);
console.log(hash);
