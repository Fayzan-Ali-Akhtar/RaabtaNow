// controllers/resumeController.js
import multer from 'multer';
import { Resume } from "../models/profile.js";

// 1. Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/'); // 🛑 Create this folder if not exists!
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 2. Controller function to handle resume upload
export const uploadResume = [
  upload.single('resume'),  // Accept only one file, field name must be 'resume'
  async (req, res) => {
    try {
      const user_id = req.user.id; // get user id from token

      const fileUrl = `/uploads/resumes/${req.file.filename}`; // file path ----> need to change this when using s3

      // 3. Save record in Resume Table
      const newResume = await Resume.create({
        user_id,
        file_url: fileUrl
        
      });
      console.log(fileUrl)

      return res.status(201).json({ success: true, resume: newResume });
    } catch (error) {
      console.error("Resume upload error:", error);
      return res.status(500).json({ success: false, message: "Resume upload failed" });
    }
  }
];

// ResumeController.js
export const getMyResumes = async (req, res) => {
  try {
    const user_id = req.user.id;

    const resumes = await Resume.findAll({ where: { user_id } });

    return res.status(200).json({ success: true, resumes }); // 🔥 plural
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
};


export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findByPk(id);

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Optional: You can also delete the physical file if you want

    await resume.destroy();

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};