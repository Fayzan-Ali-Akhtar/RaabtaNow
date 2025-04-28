import { Request, Response } from 'express';
import { Profile, Resume, CoverLetter } from "../models/profileModel";
import User from "../models/userModel";


// GET /profile
export const getProfile = async (
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

    const profile = await Profile.findOne({
      where: { user_id: user.id },
      include: { model: User, attributes: ['email'] }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    console.log("working");
    return res.json({ profile });
  } catch (error: any) {
    console.error('🔴 Error in getProfile:', error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// POST /profile
export const createProfile = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const {
        user_id,
      bio,
      location,
      contact_email,
      company,
      age,
      skills,
      interests,
      full_name,
      loc_preference,
      working_experience,
      profile_pic_id,
      experiences,
      certifications,
      social_links
    } = req.body as {
        user_id:string;
      bio: string;
      location: string;
      contact_email: string;
      company: string;
      age: number;
      skills: string[];
      interests: string[];
      full_name: string;
      loc_preference: string;
      working_experience: string;
      profile_pic_id: string;
      experiences?: any[];
      certifications?: any[];
      social_links: {
        github?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
      };
    };

    const userProfile = await Profile.create({
      user_id,
      bio,
      location,
      contact_email,
      company,
      age,
      skills,
      interests,
      full_name,
      loc_preference,
      working_experience,
      profile_pic_id,
      github_link: social_links.github,
      twitter_link: social_links.twitter,
      linkedin_link: social_links.linkedin,
      website_link: social_links.website,
    });

    return res.status(201).json({ message: "Profile created successfully", profile: userProfile });
  } catch (error: any) {
    console.error('🔴 Error creating profile:', error);
    return res.status(500).json({ message: "Error creating profile", error });
  }
};

// PUT /profile
export const updateProfile = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const {user_id} = req.body;
    console.log('🛠 Incoming profile update request');

    // Extract and verify JWT
    

    const profile = await Profile.findOne({ where: { user_id } });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found for user." });
    }

    // Fields allowed for update
    const updatableFields = [
      'full_name', 'bio', 'location', 'company',
      'contact_email', 'age', 'skills', 'interests',
      'loc_preference', 'working_experience', 'profile_pic_id',
      'github_link', 'linkedin_link', 'twitter_link', 'website_link'
    ] as const;

    updatableFields.forEach((field) => {
      if ((req.body as any)[field] !== undefined) {
        (profile as any)[field] = (req.body as any)[field];
      }
    });

    await profile.save();
    console.log('✅ Profile updated successfully');

    return res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error: any) {
    console.error('🔴 Error updating profile:', error);
    return res.status(500).json({ message: "Error updating profile", error });
  }
};
