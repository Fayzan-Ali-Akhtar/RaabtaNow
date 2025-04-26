import User from "./user.js";
import Job from "./job.js";
import Comment from "./comments.js"; // Assuming comment.js (not comments.js)

// Job ↔ Comments
Job.hasMany(Comment, { foreignKey: "job_id" });
Comment.belongsTo(Job, { foreignKey: "job_id" });

// User ↔ Comments
User.hasMany(Comment, { foreignKey: "author_id" });
Comment.belongsTo(User, { foreignKey: "author_id" });

export { User, Job, Comment };
