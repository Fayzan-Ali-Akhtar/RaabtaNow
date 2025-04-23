import { DataTypes } from "sequelize";
import sequelize from "../db/database.js";
import User from "./user.js";

const Job = sequelize.define("Job", {
  type: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: { 
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "in-app"
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(10000),

    allowNull: false,
  },
  employer: {  // maps to "company" on front-end
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {  // maps to city and country on front-end
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  min_salary: { 
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  max_salary: { 
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  employment: { // remote or on-site
    type: DataTypes.STRING,
    allowNull: true,
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  additional_file: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  view_count: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  application_count: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

Job.belongsTo(User, { foreignKey: 'posted_by' });
User.hasMany(Job, { foreignKey: 'posted_by' });

export default Job;