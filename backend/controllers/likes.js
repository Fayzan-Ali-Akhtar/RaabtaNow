import Like from "../models/likes.js";
import Job from "../models/job.js";

export const toggleLike = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const existingLike = await Like.findOne({
      where: { user_id: userId, job_id: jobId }
    });

    if (existingLike) {
      // Unlike (delete the like)
      await existingLike.destroy();

      // Decrease likes count
      await Job.increment({ likes: -1 }, { where: { id: jobId } });

      return res.status(200).json({ liked: false });
    } else {
      // New like
      await Like.create({ user_id: userId, job_id: jobId });

      // Increase likes count
      await Job.increment({ likes: 1 }, { where: { id: jobId } });

      return res.status(201).json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};
