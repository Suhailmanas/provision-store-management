#!/usr/bin/env node

require('dotenv').config()


const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function runMigration() {
  const client = await pool.connect()
  try {
    const migrationDir = path.join(__dirname, '../migrations')
    const migrations = fs.readdirSync(migrationDir).filter((file) => file.endsWith('.sql')).sort()
    console.log('[v0] Running database migrations...')
    for (const migration of migrations) {
      await client.query(fs.readFileSync(path.join(migrationDir, migration), 'utf8'))
    }
    console.log('[v0] ✓ Migration completed successfully!')
  } catch (error) {
    console.error('[v0] ✗ Migration failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
