const bcrypt = require('bcrypt');
const storedHash = '$2b$10$PgkjeLMTXnLHEdV.sqaaIeYXScb1UmKAiZRswwXHVpKmOv3E81Ely';
const candidates = ['admin@123', 'Admin@123', 'admin123', 'Admin123', 'password', 'admin@easygo', 'admin', 'admin@1234', 'EasyGo@123', 'easygo@123', 'admin@admin', 'admin@2026', 'Admin@2026', '12345678', 'admin@tgelectric', 'easygo', 'easyeasygo'];
(async () => {
  console.log('Hash:', storedHash);
  console.log('Length:', storedHash.length);
  console.log();
  for (const p of candidates) {
    const matches = await bcrypt.compare(p, storedHash);
    console.log(p.padEnd(20), '->', matches ? 'MATCH' : 'no');
  }
})();