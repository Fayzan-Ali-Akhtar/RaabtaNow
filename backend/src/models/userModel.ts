// models/user.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/database';

// 1. Define the attributes of the User
interface UserAttributes {
  id: number;         // Sequelize will auto-generate IDs if you want
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  resetToken?: string | null;
  resetTokenExp?: Date | null;
}

// 2. Define attributes needed for creation (id, createdAt are optional during creation)
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'resetToken' | 'resetTokenExp'> {}

// 3. Extend Sequelize's Model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public resetToken!: string | null;
  public resetTokenExp!: Date | null;
}

// 4. Initialize the model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
    modelName: 'User',
    tableName: 'Users',
    timestamps: false, // 
  }
);

export default User;
