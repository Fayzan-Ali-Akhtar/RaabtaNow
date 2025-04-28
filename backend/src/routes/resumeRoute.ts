// routes/resumeRoutes.js
import express from "express";
import { uploadResume, getMyResumes, deleteResume} from "../controllers/resumeController";

const Resumerouter = express.Router();

// POST /api/uploadresume
Resumerouter.post("/uploadresume", uploadResume);
Resumerouter.get('/myresumes', getMyResumes); 
Resumerouter.delete("/deleteresume/:id", deleteResume);

export default Resumerouter;
