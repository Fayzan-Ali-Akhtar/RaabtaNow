import { Sequelize } from "sequelize";

// Load environment variables from config.env
// import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Always load env from backend root
config({ path: path.join(__dirname, '../config.env') });


 
const isLocal = process.env.DB_ENV === "local";
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  isLocal ? process.env.DB_LOCAL_PASSWORD : process.env.DB_REMOTE_PASSWORD,
  {
    host: isLocal ? "localhost" : process.env.DB_HOST,
    dialect: "postgres",
    dialectOptions: process.env.DB_ENV === "remote" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    logging: false,  
  }  
); 
 
export async function testConnection() {
  try { 
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

export default sequelize;
