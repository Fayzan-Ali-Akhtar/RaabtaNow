import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/database';
import User from './userModel';

// 1. Define attributes for JobPost
interface JobPostAttributes {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  work_type: 'on-site' | 'remote' | 'hybrid';
  experience_level: 'entry' | 'mid' | 'expert';
  is_active: boolean;
  author_id?: number;  // foreign key (optional during creation, handled by association)
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define attributes needed during creation
interface JobPostCreationAttributes extends Optional<JobPostAttributes, 'id' | 'is_active' | 'createdAt' | 'updatedAt' | 'author_id'> {}

// 3. Create the JobPost class extending Model
class JobPost extends Model<JobPostAttributes, JobPostCreationAttributes> implements JobPostAttributes {
  public id!: number;
  public title!: string;
  public company!: string;
  public description!: string;
  public location!: string;
  public work_type!: 'on-site' | 'remote' | 'hybrid';
  public experience_level!: 'entry' | 'mid' | 'expert';
  public is_active!: boolean;
  public author_id?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 4. Initialize the model
JobPost.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    work_type: {
      type: DataTypes.ENUM('on-site', 'remote', 'hybrid'),
      allowNull: false,
    },
    experience_level: {
      type: DataTypes.ENUM('entry', 'mid', 'expert'),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'JobPost',
    tableName: 'JobPosts',
    timestamps: true,
  }
);

// 5. Set associations
JobPost.belongsTo(User, { foreignKey: 'author_id' });
User.hasMany(JobPost, { foreignKey: 'author_id' });

export default JobPost;
