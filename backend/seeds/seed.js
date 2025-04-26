import sequelize from '../db/database.js';
import User from '../models/user.js';

const seed = async () => {
  try {
    await sequelize.sync(); // Avoid using { force: true } unless you're okay wiping tables

    // Check if data already exists
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      console.log("✅ Sample users already exist. Skipping seeding.");
      return process.exit(0);
    }

    const users = await User.bulkCreate([
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'dummyhashedpassword'
      },
      {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'dummyhashedpassword'
      },
      {
        id: 3,
        name: 'John Smith',
        email: 'john@example.com',
        password: 'dummyhashedpassword'
      },
      {
        id: 4,
        name: 'Ali Khan',
        email: 'ali@example.com',
        password: 'dummyhashedpassword'
      },
      {
        id: 5,
        name: 'Sara Iqbal',
        email: 'sara@example.com',
        password: 'dummyhashedpassword'
      }
    ]);

    console.log(`✅ ${users.length} users created.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
