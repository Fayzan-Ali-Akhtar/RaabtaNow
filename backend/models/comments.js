import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";

const Comment = sequelize.define("Comment", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  job_id: {   // 👈 Which post this comment belongs to
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  author_id: {   // 👈 Which user wrote this
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'comments'
});

export default Comment;
