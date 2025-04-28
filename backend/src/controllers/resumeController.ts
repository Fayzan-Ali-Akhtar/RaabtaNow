import multer from 'multer';
import { Resume } from "../models/profileModel";

// Extend Express Request to include authenticated user and file


// 1. Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req:any, file:any, cb:any) => {
    cb(null, 'uploads/resumes/'); // Ensure this folder exists
  },
  filename: (req:any, file:any, cb:any) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 2. Controller function to handle resume upload
export const uploadResume = [
  upload.single('resume'), // Accept only one file under field name 'resume'
  async (req: any, res: any): Promise<any> => {
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

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file provided." });
      }

      // File URL; update when switching to S3
      const fileUrl = `/uploads/resumes/${req.file.filename}`;

      const user_id = user.id;
      // 3. Save record in Resume table
      const newResume = await Resume.create({
        user_id,
        file_url: fileUrl
      });
      console.log(fileUrl);

      return res.status(201).json({ success: true, resume: newResume });
    } catch (error: any) {
      console.error("Resume upload error:", error);
      return res.status(500).json({ success: false, message: "Resume upload failed" });
    }
  }
];

// GET /resumes
export const getMyResumes = async (
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

    const user_id = user.id;

    const resumes = await Resume.findAll({ where: { user_id } });
    return res.status(200).json({ success: true, resumes });
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
};

// DELETE /resumes/:id
export const deleteResume = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { id } = req.params;
    const resume = await Resume.findByPk(id);

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }

    // Optional: delete physical file here
    await resume.destroy();

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting resume:", error);
    return res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};
