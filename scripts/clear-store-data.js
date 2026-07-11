#!/usr/bin/env node

// Clears operational store records only. Authentication tables are deliberately
// excluded: user, account, session, and verification remain untouched.
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/)
      if (match) process.env.DATABASE_URL = match[1]
    }
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const tables = [
  'product_expiry',
  'product_price_history',
  'inventory_log',
  'daily_close',
  'sales',
  'purchases',
  'product_types',
  'product_variants',
  'products',
]

async function clearStoreData() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const table of tables) {
      const exists = await client.query('SELECT to_regclass($1) AS table_name', [`public.${table}`])
      if (exists.rows[0].table_name) await client.query(`DELETE FROM "${table}"`)
    }
    await client.query('COMMIT')
    console.log('Store data cleared. User accounts were kept.')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

clearStoreData().catch((error) => {
  console.error('Unable to clear store data:', error.message || error.code || 'database connection failed')
  process.exit(1)
})
