// src/db/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_ENDPOINT,
  DB_NAME,
} = process.env;

if (!DB_USERNAME || !DB_PASSWORD || !DB_ENDPOINT || !DB_NAME) {
  throw new Error('❌ Missing one of the DB_ environment variables');
}

const connectionString =
  `postgresql://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}` +
  `@${DB_ENDPOINT}/${DB_NAME}`;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

export default sequelize;
