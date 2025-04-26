// models/like.js
import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";
import User from "./user.js";
import Job from "./job.js"; // Post model

const Like = sequelize.define('Like', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE'
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Job, key: 'id' },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'likes',
  timestamps: true
});

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(Like, { foreignKey: 'job_id' });
Like.belongsTo(Job, { foreignKey: 'job_id' });

export default Like;
