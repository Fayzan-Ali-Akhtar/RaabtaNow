import { Request, Response } from 'express';
import Like from "../models/likesModel";
import Job from "../models/jobModel";

// Toggle like/unlike for a job
export const toggleLike = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { jobId }: any = req.params;
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or malformed Authorization header" });
    }

    // Strip off "Bearer " and parse the JSON payload
    const jsonPayload = authHeader.slice("Bearer ".length);
    let user: { id: number; name: string; email: string; };
    try {
      user = JSON.parse(jsonPayload);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in Bearer payload" });
    }

    const existingLike: any = await Like.findOne({
      where: { user_id: user.id, job_id: jobId }
    });

    if (existingLike) {
      // Unlike (delete the like)
      await existingLike.destroy();

      // Decrease likes count
      await Job.increment({ likes: -1 }, { where: { id: jobId } });

      return res.status(200).json({ liked: false });
    } else {
      // New like
      await Like.create({ user_id: user.id, job_id: jobId });

      // Increase likes count
      await Job.increment({ likes: 1 }, { where: { id: jobId } });

      return res.status(201).json({ liked: true });
    }
  } catch (error: any) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
