import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { PostCard } from "@/components/ui/post-card";
import { JobCard } from "@/components/ui/job-card";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "../../constants.ts";

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, getAuthToken } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [resumes, setResumes] = useState([]); // Array of resumes

  const [loading, setLoading] = useState(true);

  const [userPosts, setUserPosts] = useState([]);
  const [userJobPosts, setUserJobPosts] = useState([]);

  const [isEditing, setIsEditing] = useState(false);

  // For editing Posts
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState("");

  // For editing JobPosts
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobFields, setEditingJobFields] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    work_type: "",
    experience_level: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthToken();
        const [profileRes, postsRes, jobPostsRes, resumesRes] =
          await Promise.all([
            axios.get("/api/getprofile", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/myposts", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/myjobposts", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/myresumes", {
              headers: { Authorization: `Bearer ${token}` },
            }), // 🔥
          ]);
        setResumes(resumesRes.data.resumes || []);
        setProfileData(profileRes.data.profile);
        setUserPosts(postsRes.data.posts || []);
        setUserJobPosts(jobPostsRes.data.jobPosts || []);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Post Handlers ---
  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.content);
  };

  const submitEditPost = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.patch(
        "/api/update",
        { id: editingPostId, content: editingPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserPosts(
        userPosts.map((post) =>
          post.id === editingPostId ? res.data.job : post
        )
      );
      setEditingPostId(null);
      setEditingPostContent("");
      toast({ title: "Post updated" });
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = getAuthToken();
      await axios.delete(`/api/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPosts(userPosts.filter((post) => post.id !== postId));
      toast({ title: "Post deleted" });
    } catch (err) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  // --- JobPost Handlers ---
  const handleEditJobPost = (job) => {
    setEditingJobId(job.id);
    setEditingJobFields({
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      work_type: job.work_type,
      experience_level: job.experience_level,
    });
  };

  const submitEditJobPost = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.patch(
        "/api/updatejobpost",
        { id: editingJobId, ...editingJobFields },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserJobPosts(
        userJobPosts.map((job) =>
          job.id === editingJobId ? res.data.job : job
        )
      );
      setEditingJobId(null);
      toast({ title: "Job post updated" });
    } catch (err) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDeleteJobPost = async (jobId) => {
    try {
      const token = getAuthToken();
      await axios.delete(`/api/deletejobpost/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserJobPosts(userJobPosts.filter((job) => job.id !== jobId));
      toast({ title: "Job post deleted" });
    } catch (err) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  // --- Resume Handlers ---
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("resume", file);

        const res = await axios.post("/api/uploadresume", formData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast({ title: "Resume uploaded successfully!" });
        setResumes((prev) => [...prev, res.data.resume]); // 🔥 Add new one
      } catch (error) {
        console.error("Resume upload error:", error);
        toast({ title: "Upload failed", variant: "destructive" });
      }
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    try {
      await axios.delete(`/api/deleteresume/${resumeId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      // Update local resumes state
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));

      toast({ title: "Resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.patch("/api/updateprofile", profileData, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading profile...</p>
        </div>
      </MainLayout>
    );
  }

  if (!profileData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <p>No profile data found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Profile Header */}
          <div className="bg-worklink-50 p-6 sm:p-8 border-b">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-worklink-100 flex items-center justify-center text-3xl font-bold text-worklink-700">
                {profileData.full_name?.[0]}
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                <p className="text-gray-600">
                  {profileData.professional_headline}
                </p>
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
              >
                {isEditing ? "Save" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="p-6">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="jobposts">My Job Posts</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {isEditing ? (
                <>
                  {[
                    ["Full Name", "full_name"],
                    ["Email", "contact_email"],
                    ["Location", "location"],
                    ["Company", "company"],
                    ["Professional Headline", "professional_headline"],
                    ["Age", "age"],
                    ["Years of Experience", "working_experience"],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Input
                        value={profileData[key]}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            [key]: e.target.value,
                          })
                        }
                        type={
                          key === "age" || key === "working_experience"
                            ? "number"
                            : "text"
                        }
                        className="mb-3"
                      />
                    </div>
                  ))}
                  <div>
                    <Label>Skills (comma separated)</Label>
                    <Input
                      value={profileData.skills?.join(", ")}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          skills: e.target.value
                            .split(",")
                            .map((s: string) => s.trim()),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Bio:</strong> {profileData.bio}
                  </p>
                  <p>
                    <strong>Email:</strong> {profileData.contact_email}
                  </p>
                  <p>
                    <strong>Location:</strong> {profileData.location}
                  </p>
                  <p>
                    <strong>Company:</strong> {profileData.company}
                  </p>
                  <p>
                    <strong>Skills:</strong> {profileData.skills?.join(", ")}
                  </p>
                  <p>
                    <strong>Professional Headline:</strong>{" "}
                    {profileData.professional_headline}
                  </p>
                </>
              )}
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4">
              {editingPostId && (
                <div className="bg-yellow-100 p-4 mb-4 rounded">
                  <Textarea
                    rows={3}
                    value={editingPostContent}
                    onChange={(e) => setEditingPostContent(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingPostId(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={submitEditPost}>Update Post</Button>
                  </div>
                </div>
              )}
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  author={{ id: post.author_id, name: user?.name || "You" }}
                  content={post.content}
                  imageUrl={post.media_url || ""} // if you don't have imageUrl, pass empty
                  likes={post.likes || 0} // fallback to 0 if likes not present
                  comments={post.comments_count || 0} // fallback to 0 if comments not present
                  timestamp={post.createdAt} // assuming createdAt exists
                  isOwnPost
                  onEdit={() => handleEditPost(post)}
                  onDelete={() => handleDeletePost(post.id)}
                />
              ))}
            </TabsContent>

            {/* JobPosts Tab */}
            <TabsContent value="jobposts" className="space-y-4">
              {editingJobId && (
                <div className="bg-yellow-100 p-4 mb-4 rounded">
                  <Input
                    value={editingJobFields.title}
                    onChange={(e) =>
                      setEditingJobFields({
                        ...editingJobFields,
                        title: e.target.value,
                      })
                    }
                    className="mb-2"
                    placeholder="Job Title"
                  />
                  <Input
                    value={editingJobFields.company}
                    onChange={(e) =>
                      setEditingJobFields({
                        ...editingJobFields,
                        company: e.target.value,
                      })
                    }
                    className="mb-2"
                    placeholder="Company"
                  />
                  <Textarea
                    value={editingJobFields.description}
                    onChange={(e) =>
                      setEditingJobFields({
                        ...editingJobFields,
                        description: e.target.value,
                      })
                    }
                    className="mb-2"
                    placeholder="Description"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingJobId(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={submitEditJobPost}>Update Job</Button>
                  </div>
                </div>
              )}
              {userJobPosts.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  description={job.description}
                  tags={[job.work_type, job.experience_level]}
                  isOwnPost
                  onEdit={() => handleEditJobPost(job)}
                  onDelete={() => handleDeleteJobPost(job.id)}
                />
              ))}
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume" className="text-center">
              {/* Upload Section */}
              <div className="flex flex-col items-center">
                <label
                  htmlFor="resume-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
                >
                  Upload Resume
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                />
              </div>

              {/* Uploaded Resumes Section */}
              <div className="mt-8 space-y-4">
                {resumes.length === 0 ? (
                  <p>No resumes uploaded yet.</p>
                ) : (
                  resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded shadow"
                    >
                      <a
                        href={`${BASE_URL}${resume.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {resume.file_url
                          .split("/")
                          .pop()
                          ?.split("-")
                          .slice(1)
                          .join("-")}
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteResume(resume.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
