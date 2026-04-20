import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

export const mockUsers = [
  { id: 1, email: 'admin@mail.com', password: '123456', role: 'admin' },
  { id: 2, email: 'user@mail.com', password: '123456', role: 'user' }
];

export let pool: pkg.Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });
  
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err.message);
  });
}

export async function initDB() {
  if (!pool) {
    console.log('No DATABASE_URL provided. Using in-memory mock database.');
    return;
  }
  
  try {
    const client = await pool.connect();
    client.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      );
    `);

    // Seed Data Awal
    const checkAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@mail.com']);
    if (checkAdmin.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['admin@mail.com', '123456', 'admin']
      );
    }

    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', ['user@mail.com']);
    if (checkUser.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
        ['user@mail.com', '123456', 'user']
      );
    }
    console.log('PostgreSQL initialized with seed data successfully.');
  } catch (err: any) {
    console.error(`Error initializing database: ${err.message}`);
    console.log('Disabling PostgreSQL pool. Falling back to in-memory mock database.');
    pool = null;
  }
}
