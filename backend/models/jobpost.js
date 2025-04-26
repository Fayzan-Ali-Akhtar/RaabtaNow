import { DataTypes } from 'sequelize';
import sequelize from '../db/database.js';
import User from './user.js'; // Assuming you already have a User model

const JobPost = sequelize.define('JobPost', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  work_type: {
    type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
    allowNull: false,
  },
  experience_level: {
    type: DataTypes.ENUM('entry', 'mid', 'expert'),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
  tableName: 'JobPosts',
});

JobPost.belongsTo(User, { foreignKey: 'author_id' });
User.hasMany(JobPost, { foreignKey: 'author_id' });

export default JobPost;
