import Job from "../models/job.js";
import JobPost from '../models/jobpost.js';
import User from '../models/user.js';



export const getAllJobs = async (req, res) => {
  try {
    console.log("📩 [Request] getAllJobs called");

    const jobs = await Job.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      }],
      order: [['createdAt', 'DESC']],
    });

    console.log(`📝 [Fetched] Total jobs fetched: ${jobs.length}`);

    jobs.forEach((job, index) => {
      console.log(`🔍 Job ${index + 1}:`, {
        id: job.id,
        content: job.content,
        author: job.author ? {
          id: job.author.id,
          name: job.author.name,
          email: job.author.email
        } : "❌ No Author Found"
      });
    });

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs: jobs || [],
    });

  } catch (error) {
    console.error("🚨 Error in getAllJobs:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching jobs",
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, media_url, media_type } = req.body;
    // const author_id = req.user?.id; // recommended when token added
    const author_id = req.user?.id || req.body.author_id;

    if (!content || !author_id) {
      return res.status(400).json({
        success: false,
        message: "Post content and author ID are required",
      });
    }

    // 1. Create the Job
    const newJob = await Job.create({
      content,
      media_url: media_url || null,
      media_type: media_type || null,
      author_id,
    });

    // 2. Fetch again including author info
    const postWithAuthor = await Job.findOne({
      where: { id: newJob.id },
      include: [{
        model: User,
        as: "author",
        attributes: ["id", "name", "email"], // only show safe fields
      }],
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      job: postWithAuthor,
    });
  } catch (error) {
    console.error("❌ Error in createPost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the post",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id, ...content } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required for updating",
      });
    }

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "No job found with this ID",
      });
    }

    // 1. Update the post
    await job.update({ ...content });

    // 2. Fetch again with author included
    const updatedJobWithAuthor = await Job.findOne({
      where: { id: job.id },
      include: [{
        model: User,
        as: "author",
        attributes: ["id", "name", "email"],
      }],
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJobWithAuthor,
    });
  } catch (error) {
    console.error("❌ Error in updatePost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating job",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required for deletion" });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "No job found with this ID" });
    }

    await job.destroy();
    return res.status(200).json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Error in deletePost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting job"
    });
  }
};

// function for jobpost handling
export const createJobPost = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      work_type,
      experience_level,
      author_id // You’ll get this from session or token in a real app
    } = req.body;

    if (!title || !company || !description || !location || !work_type || !experience_level || !author_id) {
      return res.status(400).json({
        success: false,
        message: "All job fields are required."
      });
    }

    const job = await JobPost.create({
      title,
      company,
      description,
      location,
      work_type,
      experience_level,
      author_id
    });

    res.status(201).json({
      success: true,
      message: "Job post created successfully",
      job
    });
  } catch (error) {
    console.error("Error in createJobPost:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job post"
    });
  }
};


export const deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobPost.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job post not found"
      });
    }

    await job.destroy();

    res.status(200).json({
      success: true,
      message: "Job post deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteJobPost:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job post"
    });
  }
};


export const editJobPost = async (req, res) => {
  try {
    const { id, ...updates } = req.body;

    const job = await JobPost.findByPk(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job post not found"
      });
    }

    await job.update(updates);

    res.status(200).json({
      success: true,
      message: "Job post updated successfully",
      job
    });
  } catch (error) {
    console.error("Error in editJobPost:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job post"
    });
  }
};


export const getAllJobPosts = async (req, res) => {
  try {
    const jobPosts = await JobPost.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email']
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: "Job posts retrieved successfully",
      jobPosts
    });
  } catch (error) {
    console.error("Error in getAllJobPosts:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching job posts"
    });
  }
};


export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const myPosts = await Job.findAll({
      where: { author_id: userId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, posts: myPosts });
  } catch (error) {
    console.error("Error fetching my posts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



export const getMyJobPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const myJobPosts = await JobPost.findAll({
      where: { author_id: userId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ success: true, jobPosts: myJobPosts });
  } catch (error) {
    console.error("Error fetching my job posts:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
