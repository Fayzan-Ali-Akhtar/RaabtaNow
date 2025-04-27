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
  throw new Error('Missing one of the DB_ environment variables');
}

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_ENDPOINT.split(':')[0], // split in case your DB_ENDPOINT includes ":5432"
  port: DB_ENDPOINT.includes(':') ? parseInt(DB_ENDPOINT.split(':')[1]) : 5432, // default port 5432
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // require SSL for AWS RDS
      rejectUnauthorized: false, // disable SSL cert validation
    },
  },
  logging: false, // disable logging; remove or set to true if you want SQL logs
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;
