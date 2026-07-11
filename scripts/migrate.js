#!/usr/bin/env node

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function runMigration() {
  const client = await pool.connect()
  try {
    const migrationsDir = path.join(__dirname, '../migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
    
    console.log('[v0] Running database migrations...')
    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(migrationPath, 'utf8')
      
      console.log(`[v0] Applying ${file}...`)
      await client.query(sql)
      console.log(`[v0] ✓ ${file} completed`)
    }
    console.log('[v0] ✓ All migrations completed successfully!')
  } catch (error) {
    console.error('[v0] ✗ Migration failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
