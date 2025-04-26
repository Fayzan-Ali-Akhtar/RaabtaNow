// models/user.js
import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";


const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExp: {  // minor typo fixed from restTokenExp to resetTokenExp
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'Users'
});

export default User;
