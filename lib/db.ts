// lib/db.ts
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Initialize database tables
export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS lookups (
      id SERIAL PRIMARY KEY,
      domain TEXT NOT NULL,
      record_type TEXT NOT NULL,
      resolver TEXT NOT NULL,
      result_json JSONB NOT NULL,
      latency_ms INTEGER NOT NULL,
      ttl INTEGER,
      cache_status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      domain TEXT NOT NULL,
      old_data JSONB,
      new_data JSONB NOT NULL,
      changed_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_lookups_domain ON lookups(domain);
    CREATE INDEX IF NOT EXISTS idx_lookups_created_at ON lookups(created_at);
    CREATE INDEX IF NOT EXISTS idx_history_domain ON history(domain);
  `);
}