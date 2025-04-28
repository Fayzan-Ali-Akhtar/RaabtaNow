import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize";
import User from "./userModel";
import Job from "./jobModel";        // Simple post model
import JobPost from "./jobPostModel"; // Job listing model
import { Model } from "sequelize";

// Resume Model
class Resume extends Model {}
Resume.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Resume',
  tableName: 'resumes',
  timestamps: false,
});

// Cover Letter Model
class CoverLetter extends Model {}
CoverLetter.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'CoverLetter',
  tableName: 'cover_letters',
  timestamps: false,
});

// Profile Model
class Profile extends Model {}
Profile.init({
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  bio: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  contact_email: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
  full_name: { type: DataTypes.STRING, allowNull: false },
  working_experience: { type: DataTypes.INTEGER, allowNull: false },
  profile_pic_id: { type: DataTypes.STRING, allowNull: true },
  github_link: { type: DataTypes.STRING, allowNull: true },
  twitter_link: { type: DataTypes.STRING, allowNull: true },
  linkedin_link: { type: DataTypes.STRING, allowNull: true },
  website_link: { type: DataTypes.STRING, allowNull: true },
  professional_headline: { type: DataTypes.STRING, allowNull: true },
}, {
  sequelize,
  modelName: 'Profile',
  tableName: 'profiles',
  timestamps: false,
});

// 🔥 Associations
User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Resume, { foreignKey: 'user_id' });
Resume.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CoverLetter, { foreignKey: 'user_id' });
CoverLetter.belongsTo(User, { foreignKey: 'user_id' });

// 🔥 Associations for Posts
User.hasMany(Job, { foreignKey: 'author_id' });
Job.belongsTo(User, { foreignKey: 'author_id' });

User.hasMany(JobPost, { foreignKey: 'author_id' });
JobPost.belongsTo(User, { foreignKey: 'author_id' });

// Final Exports
export { Profile, Resume, CoverLetter };
