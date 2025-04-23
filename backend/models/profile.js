import { DataTypes } from "sequelize";
import sequelize from "../db/database.js"
import User from "./user.js";

const Profile = sequelize.define('Profile', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,  
        key: 'id'     
    },
    onDelete: 'CASCADE'  // delete related profile if the user is deleted
  },
  bio: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loc_preference: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['remote', 'on-site']] 
    }
  },
  working_experience: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profile_pic_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  github_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitter_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedin_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  tableName: 'profiles',
  timestamps: false
});

const Experience = sequelize.define('Experience', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User, 
        key: 'id'    
    },
    onDelete: 'CASCADE' 
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // months
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  }
}, {
  tableName: 'experiences',
  timestamps: false
});

const Certification = sequelize.define('Certification', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,  
        key: 'id'     
    },
    onDelete: 'CASCADE'  
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issued_by: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'certifications',
  timestamps: false
});

User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Experience, { foreignKey: 'user_id' });
Experience.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Certification, { foreignKey: 'user_id' });
Certification.belongsTo(User, { foreignKey: 'user_id' });

// Export models
export { Profile, Experience, Certification };
