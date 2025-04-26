import { Profile, Resume, CoverLetter} from "../models/profile.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const getProfile = async (req, res) => {
  try {
    console.log('🔵 Authenticated user:', req.user); // Add this for debugging

    const userId = req.user.id;
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: { model: User, attributes: ['email'] }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile });
  } catch (error) {
    console.error('🔴 Error in getProfile:', error);
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

export const updateProfile = async (req, res) => {
  try {
    console.log('🛠 Incoming profile update request');

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized: No valid token provided." });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user_id = decoded.id;

    const profile = await Profile.findOne({ where: { user_id } });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found for user." });
    }

    // Only update fields that were sent in the request
    const updatableFields = [
      "full_name", "bio", "location", "company",
      "contact_email", "age", "skills", "interests",
      "loc_preference", "working_experience", "profile_pic_id",
      "github_link", "linkedin_link", "twitter_link", "website_link"
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    console.log('✅ Profile updated successfully');

    return res.status(200).json({ message: "Profile updated successfully", profile });

  } catch (error) {
    console.error('🔴 Error updating profile:', error);
    return res.status(500).json({ message: "Error updating profile", error });
  }
};