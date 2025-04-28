import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/sequelize";

// 1. Define the attributes of the Job
interface JobAttributes {
  id: number;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  likes: number;
  author_id: number;
  comments_count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define attributes needed during creation (id, timestamps optional)
interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'likes' | 'comments_count' | 'createdAt' | 'updatedAt'> {}

// 3. Define the Job model class
class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public content!: string;
  public media_url!: string | null;
  public media_type!: string | null;
  public likes!: number;
  public author_id!: number;
  public comments_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Initialize the model
Job.init(
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
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'Jobs',
    timestamps: true,
  }
);

export default Job;
