// models/job.js
import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";

const Job = sequelize.define("Job", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comments_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: 'Jobs'
});

export default Job;
