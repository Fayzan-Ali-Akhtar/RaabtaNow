import { Request, Response } from 'express';
import Job from "../models/jobModel";
import JobPost from "../models/jobPostModel";
import User from "../models/userModel";

// GET /jobs
export const getAllJobs = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    console.log("📩 [Request] getAllJobs called");

    const jobs: any[] = await Job.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    console.log(`📝 [Fetched] Total jobs fetched: ${jobs.length}`);
    jobs.forEach((job: any, index: number) => {
      console.log(`🔍 Job ${index + 1}:`, {
        id: job.id,
        content: job.content,
        author: job.author ? {
          id: job.author.id,
          name: job.author.name,
          email: job.author.email,
        } : "❌ No Author Found",
      });
    });

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs: jobs || [],
    });
  } catch (error: any) {
    console.error("🚨 Error in getAllJobs:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching jobs",
    });
  }
};

// POST /jobs (generic post)
export const createPost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { content, media_url, media_type }: any = req.body;
    const author_id: any = req.user?.id || req.body.author_id;

    if (!content || !author_id) {
      return res.status(400).json({
        success: false,
        message: "Post content and author ID are required",
      });
    }

    const newJob: any = await Job.create({
      content,
      media_url: media_url || null,
      media_type: media_type || null,
      author_id,
    });

    const postWithAuthor: any = await Job.findOne({
      where: { id: newJob.id },
      include: [{
        model: User,
        as: "author",
        attributes: ['id', 'name', 'email'],
      }],
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      job: postWithAuthor,
    });
  } catch (error: any) {
    console.error("❌ Error in createPost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the post",
    });
  }
};

// PUT /jobs
export const updatePost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { id, ...content }: any = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required for updating",
      });
    }

    const job: any = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "No job found with this ID",
      });
    }

    await job.update({ ...content });
    const updatedJobWithAuthor: any = await Job.findOne({
      where: { id: job.id },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJobWithAuthor,
    });
  } catch (error: any) {
    console.error("❌ Error in updatePost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating job",
    });
  }
};

// DELETE /jobs/:id
export const deletePost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { id }: any = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required for deletion",
      });
    }

    const job: any = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "No job found with this ID",
      });
    }

    await job.destroy();
    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deletePost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting job",
    });
  }
};

// POST /jobposts
export const createJobPost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const {
      title,
      company,
      description,
      location,
      work_type,
      experience_level,
      author_id,
    }: any = req.body;

    if (!title || !company || !description || !location || !work_type || !experience_level || !author_id) {
      return res.status(400).json({
        success: false,
        message: "All job fields are required.",
      });
    }

    const job: any = await JobPost.create({
      title,
      company,
      description,
      location,
      work_type,
      experience_level,
      author_id,
    });

    return res.status(201).json({
      success: true,
      message: "Job post created successfully",
      job,
    });
  } catch (error: any) {
    console.error("Error in createJobPost:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job post",
    });
  }
};

// DELETE /jobposts/:id
export const deleteJobPost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { id }: any = req.params;
    const job: any = await JobPost.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }

    await job.destroy();
    return res.status(200).json({
      success: true,
      message: "Job post deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteJobPost:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job post",
    });
  }
};

// PUT /jobposts
export const editJobPost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { id, ...updates }: any = req.body;
    const job: any = await JobPost.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job post not found",
      });
    }

    await job.update(updates);
    return res.status(200).json({
      success: true,
      message: "Job post updated successfully",
      job,
    });
  } catch (error: any) {
    console.error("Error in editJobPost:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job post",
    });
  }
};

// GET /jobposts
export const getAllJobPosts = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const jobPosts: any[] = await JobPost.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email'],
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: "Job posts retrieved successfully",
      jobPosts,
    });
  } catch (error: any) {
    console.error("Error in getAllJobPosts:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching job posts",
    });
  }
};

// GET /myposts
export const getMyPosts = async (
  req: any,
  res: any
): Promise<any> => {
  try {
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

    const myPosts: any[] = await Job.findAll({
      where: { author_id: user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, posts: myPosts });
  } catch (error: any) {
    console.error("Error fetching my posts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /myjobposts
export const getMyJobPosts = async (
  req: any,
  res: any
): Promise<any> => {
  try {
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

    const myJobPosts: any[] = await JobPost.findAll({
      where: { author_id: user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, jobPosts: myJobPosts });
  } catch (error: any) {
    console.error("Error fetching my job posts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
