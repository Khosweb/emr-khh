import mysql from 'mysql2/promise';

let pool;

export async function getDbConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hos',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000, // Fail fast if unreachable (5 seconds)
    });
  }
  return pool;
}

/**
 * Execute query securely using prepared statements
 * @param {string} sql - SQL query string with placeholders (?)
 * @param {Array} params - parameters to bind
 */
export async function query(sql, params = []) {
  try {
    const db = await getDbConnection();
    const [results] = await db.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database Query Error:', error);
    // Preserve the original error code and message
    const dbError = new Error(`Database query execution failed: ${error.message}`);
    dbError.code = error.code || 'DB_ERROR';
    dbError.errno = error.errno;
    dbError.syscall = error.syscall;
    throw dbError;
  }
}

