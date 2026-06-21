const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, val] = line.split('=');
    env[key.trim()] = val.trim();
  }
});

async function main() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: parseInt(env.DB_PORT || '3306')
  });

  try {
    const vn = '690611074701';
    console.log(`Querying details for VN: ${vn}...`);

    // 1. Query ovst table
    const [ovstRows] = await connection.execute(
      `SELECT o.vn, o.hn, o.vstdate, o.vsttime, o.pttype, p.name as pttype_name 
       FROM ovst o
       LEFT OUTER JOIN pttype p ON p.pttype = o.pttype
       WHERE o.vn = ?`,
      [vn]
    );
    console.log('OVST / PTType Row:', ovstRows);

    // 2. Query opdscreen table
    const [opdRows] = await connection.execute(
      `SELECT * FROM opdscreen WHERE vn = ?`,
      [vn]
    );
    console.log('OPD Screen Row:', opdRows);

  } catch (err) {
    console.error('Error during query:', err);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
