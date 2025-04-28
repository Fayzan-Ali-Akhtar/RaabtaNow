import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "@/components/ui/post-card";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext"; // 👈 Import useAuth
import { VITE_BACKEND_URL } from "@/constant";

const FeedPage = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // 👈 Get logged in user

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
  // const [likesCount, setLikesCount] = useState(likes || 0);
  const [postIsLikedByUser, setPostIsLikedByUser] = useState(false); // assume not liked initially

  const { getAuthToken } = useAuth();

  // 🛑 Add loading screen if user not loaded yet
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${VITE_BACKEND_URL}/api/getposts`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setPosts(
         ( [...res.data.jobs].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) as any)
        );
      } catch (err: any) {
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
      const res = await axios.post(
        `${VITE_BACKEND_URL}/api/createpost`,
        {
          content: newPostContent,
          author_id: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setPosts(([res.data.job, ...posts] as any));
      setNewPostContent("");
      toast({ title: "Post created" });
    } catch (err: any) {
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
    if (
      !jobTitle ||
      !jobDescription ||
      !jobType ||
      !experienceLevel ||
      !companyName
    ) {
      return toast({
        title: "Missing fields",
        description: "Fill out all job fields before posting.",
        variant: "destructive",
      });
    }

    try {
      const res = await axios.post(
        `${VITE_BACKEND_URL}/api/createjobpost`,
        {
          title: jobTitle,
          description: jobDescription,
          company: companyName,
          location: jobLocation,
          work_type: jobType,
          experience_level: experienceLevel,
          author_id: user?.id, // ✅ use logged-in user's id
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      toast({ title: "Job posted successfully" });

      setJobTitle("");
      setCompanyName("");
      setJobDescription("");
      setJobLocation("");
      setJobType("");
      setExperienceLevel("");
      setShowJobForm(false);
    } catch (err: any) {
      toast({
        title: "Job post failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/api/delete/${postId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      setPosts(posts.filter((post:any) => post.id !== postId));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEditPost = (postId: string) => {
    const postToEdit = posts.find((p:any) => p.id === postId);
    if (postToEdit) {
      setEditingPostId(postId);
      setEditingContent((postToEdit as any).content);
    }
  };

  const submitEditPost = async () => {
    try {
      const res = await axios.patch(
        `${VITE_BACKEND_URL}/api/update`,
        {
          id: editingPostId,
          content: editingContent,
        },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setPosts(
        (posts.map((post:any) => (post.id === editingPostId ? res.data.job : post)) as any)
      );

      setEditingPostId(null);
      setEditingContent("");
      toast({ title: "Post updated" });
    } catch (err: any) {
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
            <select
              className="w-full p-2 mb-2 border rounded"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            >
              <option value="">Select Company</option>
              <option value="Google (Alphabet Inc.)">
                Google (Alphabet Inc.)
              </option>
              <option value="Microsoft">Microsoft</option>
              <option value="Amazon">Amazon</option>
              <option value="Apple">Apple</option>
              <option value="Meta (formerly Facebook)">
                Meta (formerly Facebook)
              </option>
              <option value="Netflix">Netflix</option>
              <option value="NVIDIA">NVIDIA</option>
              <option value="Tesla">Tesla</option>
              <option value="Adobe">Adobe</option>
              <option value="Salesforce">Salesforce</option>
            </select>

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
                  post.author
                    ? { id: post.author.id, name: post.author.name }
                    : { id: post.author_id, name: "Anonymous" }
                }
                content={post.content}
                imageUrl={post.media_url}
                likes={post.likes}
                comments={post.comments_count}
                timestamp={post.createdAt}
                isOwnPost={post.author_id === user?.id}
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
