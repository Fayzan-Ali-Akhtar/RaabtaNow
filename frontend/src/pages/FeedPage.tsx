import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/ui/post-card";
import MainLayout from "@/components/layout/MainLayout";

const FeedPage = () => {
  const { toast } = useToast();

  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/getposts");
        setPosts(
          [...res.data.jobs].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (err) {
        toast({
          title: "Error loading posts",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post("/api/createpost", {
        content: newPostContent,
        author_id: 1,
      });

      setPosts([res.data.job, ...posts]);
      setNewPostContent("");
      toast({ title: "Post created" });
    } catch (err) {
      toast({
        title: "Post failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobPostSubmit = async () => {
    if (!jobTitle || !jobDescription || !jobType || !experienceLevel || !companyName) {
      return toast({
        title: "Missing fields",
        description: "Fill out all job fields before posting.",
        variant: "destructive",
      });
    }
  
    try {
      const res = await axios.post("/api/createjobpost", {
        title: jobTitle,
        description: jobDescription,
        company: companyName, // 👈 include company name
        location: jobLocation,
        work_type: jobType,
        experience_level: experienceLevel,
        author_id: 1,
      });
  
      toast({ title: "Job posted successfully" });
  
      // Reset
      setJobTitle("");
      setCompanyName("");
      setJobDescription("");
      setJobLocation("");
      setJobType("");
      setExperienceLevel("");
      setShowJobForm(false);
    } catch (err) {
      toast({
        title: "Job post failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      await axios.delete(`/api/delete/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
      toast({ title: "Post deleted" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    const postToEdit = posts.find((p) => p.id === postId);
    if (postToEdit) {
      setEditingPostId(postId);
      setEditingContent(postToEdit.content);
    }
  };

  const submitEditPost = async () => {
    try {
      const res = await axios.patch("/api/update", {
        id: editingPostId,
        content: editingContent,
      });

      setPosts(
        posts.map((post) => (post.id === editingPostId ? res.data.job : post))
      );

      setEditingPostId(null);
      setEditingContent("");
      toast({ title: "Post updated" });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

        {/* New Post Form */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <form onSubmit={handlePostSubmit}>
            <Textarea
              placeholder="What's on your mind?"
              className="resize-none mb-4"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>

          {/* 🔥 Move this outside the form */}
          <div className="mt-3 text-right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowJobForm((prev) => !prev)}
            >
              {showJobForm ? "Close Job Form" : "Post a Job"}
            </Button>
          </div>
        </div>

        {/* Job Form */}
        {showJobForm && (
          <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Post a Job</h3>
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Textarea
              rows={4}
              className="w-full resize-none mb-2"
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            
            <input
              className="w-full p-2 mb-2 border rounded"
              placeholder="Location"
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
            />
            <select
              className="w-full p-2 mb-2 border rounded"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">Select Work Type</option>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              className="w-full p-2 mb-3 border rounded"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="">Select Experience Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="expert">Expert Level</option>
            </select>
            <Button onClick={handleJobPostSubmit}>Post Job</Button>
          </div>
        )}

        {/* Edit Form */}
        {editingPostId && (
          <div className="bg-yellow-50 border border-yellow-300 p-4 mb-6 rounded">
            <h3 className="text-lg font-semibold mb-2">Edit Post</h3>
            <Textarea
              rows={3}
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="resize-none mb-3"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPostId(null);
                  setEditingContent("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitEditPost}>Update</Button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">
              No posts yet. Start by creating one!
            </p>
          ) : (
            posts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={
                  post.author || { id: post.author_id, name: "Anonymous" }
                }
                content={post.content}
                imageUrl={post.media_url}
                likes={post.likes}
                comments={post.comments_count}
                timestamp={post.createdAt}
                isOwnPost={post.author_id === 1}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FeedPage;
