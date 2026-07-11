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
    const migrationPath = path.join(__dirname, '../migrations/001_add_product_enhancements.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('[v0] Running database migration...')
    await client.query(sql)
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
