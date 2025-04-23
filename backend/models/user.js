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
  restTokenExp: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
});


export default User;
