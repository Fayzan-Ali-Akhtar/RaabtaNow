import User from "./userModel";
import Job from "./jobModel";
import Comment from "./commentsModel";

// Define associations between models

// Job ↔ Comments (One Job has many Comments)
Job.hasMany(Comment, { foreignKey: "job_id" });
Comment.belongsTo(Job, { foreignKey: "job_id" });

// User ↔ Comments (One User has many Comments)
User.hasMany(Comment, { foreignKey: "author_id" });
Comment.belongsTo(User, { foreignKey: "author_id" });

export { User, Job, Comment };
