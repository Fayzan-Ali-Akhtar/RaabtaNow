import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_ENDPOINT,
  DB_NAME,
} = process.env

if (!DB_USERNAME || !DB_PASSWORD || !DB_ENDPOINT || !DB_NAME) {
  throw new Error('Missing one of the DB_ environment variables')
}

const connectionString =
  `postgresql://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}` +
  `@${DB_ENDPOINT}/${DB_NAME}`

const pool = new Pool({
  connectionString,
  ssl: {
    // for RDS you can disable certificate validation, or replace with the RDS CA cert
    rejectUnauthorized: false
  }
})

pool.on('error', err => {
  console.error('Unexpected idle client error', err)
})

export default pool
