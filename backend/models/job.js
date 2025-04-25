import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";
import User from "./user.js";

const Job = sequelize.define("Job", {
  content: {
    type: DataTypes.TEXT, // Supports long posts
    allowNull: false,
  },
  media_url: {
    type: DataTypes.STRING, // Image, video, doc, etc.
    allowNull: true,
  },
  media_type: {
    type: DataTypes.STRING, // 'image', 'video', 'file', etc.
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'Jobs'
});

Job.belongsTo(User, { foreignKey: 'author_id' });
User.hasMany(Job, { foreignKey: 'author_id' });

export default Job;
