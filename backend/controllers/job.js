import Job from "../models/job.js";

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ success: false, message: "No jobs found" });
    }
    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching jobs"
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      jobType,
      title,
      category,
      description,
      company,    
      city,
      country,
      minSalary,
      maxSalary,
      employment,
      experience,
      website,
      emailAddress,
      phoneNumber,
      posted_by,
    } = req.body;

    console.log(req.body)

    if (!jobType || !title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide jobType, title, category, and description.",
      });
    }

    let location = "";
    if (city && country) {
      location = `${city}, ${country}`;
    } else if (city) {
      location = city;
    } else if (country) {
      location = country;
    }

    const newJobData = {
      type: jobType,
      title,
      category,
      description,
      employer: company,
      location,
      min_salary: minSalary || null,
      max_salary: maxSalary || null,
      employment,
      experience,
      website,
      email_address: emailAddress || null,
      phone_number: phoneNumber || null,
      posted_by: posted_by || null,
    };

    const newJob = await Job.create(newJobData);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error("Error in createJob:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating job",
    });
  }
};

export const updateJob = async (req, res) => {
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
    console.error("Error in updateJob:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating job"
    });
  }
};

export const deleteJob = async (req, res) => {
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
    console.error("Error in deleteJob:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting job"
    });
  }
};


