// models/user.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/database.js";

// 1. Define a TypeScript interface for User attributes
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  resetToken?: string | null;
  resetTokenExp?: Date | null;
}

// 2. Define a type for User creation attributes (when creating, `id` and `createdAt` are auto-generated)
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "createdAt" | "resetToken" | "resetTokenExp"> {}

// 3. Define the model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public resetToken!: string | null;
  public resetTokenExp!: Date | null;
}

// 4. Initialize model
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
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
    resetTokenExp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "Users",
    timestamps: false,  // 👈 because you're manually controlling createdAt (no updatedAt present)
  }
);

export default User;
