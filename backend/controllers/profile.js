import { Profile, Resume, CoverLetter} from "../models/profile.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // assume user ID from session/token
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: { model: User, attributes: ['email'] } // optional
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const createProfile = async (req, res) => {
  const { bio, location, contact_email, company,  age,  skills,   interests,   
    full_name, loc_preference, working_experience,   profile_pic_id, experiences, certifications, social_links } = req.body;

    const authHeader = req.headers.authorization;  
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user_id = decoded.id;    

  try {
    const userProfile = await Profile.create({
      user_id, bio, location, contact_email, 
      company,  age, skills, interests,   
      full_name, loc_preference, working_experience,   
      profile_pic_id, github_link: social_links.github, twitter_link:social_links.twitter, 
      linkedin_link: social_links.linkedin, website_link: social_links.website,
    });

    if (experiences && experiences.length > 0) {
      await Experience.bulkCreate(
        experiences.map(exp => ({
          user_id,
          job_title: exp.job_title,
          employer: exp.employer,
          duration: exp.duration,
          description: exp.description,
          skills: exp.skills
        }))
      );
    }

    if (certifications && certifications.length > 0) {
      await Certification.bulkCreate(
        certifications.map(cert => ({
          user_id,
          title: cert.title,
          issued_by: cert.issued_by
        }))
      );
    }

    return res.status(201).json({ message: "Profile created successfully", profile: userProfile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating profile", error });
  }
};
