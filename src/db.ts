import { Pool } from 'pg';
import { config } from 'dotenv';

config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
