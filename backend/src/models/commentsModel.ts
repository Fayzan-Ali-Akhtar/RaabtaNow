import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

// 1. Define the attributes of Comment
interface CommentAttributes {
  id: number;
  content: string;
  job_id: number;
  author_id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define attributes needed during creation
interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// 3. Define the Comment model class
class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public job_id!: number;
  public author_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Initialize the model
Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true,
  }
);

export default Comment;
