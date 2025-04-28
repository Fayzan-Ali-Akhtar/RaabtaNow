import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";
import User from "./userModel";
import Job from "./jobModel";

// 1. Define the attributes of Like
interface LikeAttributes {
  id: number;
  user_id: number;
  job_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define attributes needed during creation
interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 3. Define the Like model class
class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: number;
  public user_id!: number;
  public job_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Initialize the model
Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Job, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
  }
);

// 5. Define associations
User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });

Job.hasMany(Like, { foreignKey: 'job_id' });
Like.belongsTo(Job, { foreignKey: 'job_id' });

export default Like;
