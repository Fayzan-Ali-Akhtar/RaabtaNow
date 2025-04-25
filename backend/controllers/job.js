import Job from "../models/job.js";
import JobPost from '../models/jobpost.js';
import User from '../models/user.js';



export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    // console.log("🔄 Returning jobs:", jobs);
    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs: jobs || []
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching jobs"
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, media_url, media_type } = req.body;
    // const author_id = req.user?.id; // recommended over trusting req.body //-------> uncomment when token added
    const author_id = req.user?.id || req.body.author_id;


    if (!content || !author_id) {
      return res.status(400).json({
        success: false,
        message: "Post content and author ID are required",
      });
    }

    const newJob = await Job.create({
      content,
      media_url: media_url || null,
      media_type: media_type || null,
      author_id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error in createPost:", error);
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
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required for updating" });
    }

    const job = await Job.findByPk(id);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "No job found with this ID" });
    }

    await job.update({ ...content });
    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    console.error("Error in updatePost:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating job"
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