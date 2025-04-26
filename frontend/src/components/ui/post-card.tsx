import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { BASE_URL } from '../../../constants';
import { Textarea } from '@/components/ui/textarea'; // 🆕

interface PostAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PostCardProps {
  id: string;
  author: PostAuthor;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isOwnPost?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export function PostCard({
  id,
  author,
  content,
  imageUrl,
  likes,
  comments,
  timestamp,
  isOwnPost = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const { toast } = useToast();
  const { getAuthToken, user } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    try {
      await axios.post(`${BASE_URL}/api/toggle/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (isLiked) {
        setLikeCount((prev) => prev - 1);
      } else {
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);

      toast({
        title: isLiked ? "Post unliked" : "Post liked",
        duration: 1500,
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Failed to toggle like",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id);
  };

  const fetchComments = async (postId: string) => {
    setLoadingComments(true); // start loading
    try {
      const res = await axios.get(`${BASE_URL}/api/postcomment/${postId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setCommentList(res.data.comments || []); // ✅ directly setCommentList
    } catch (err) {
      console.error("Failed to load comments", err);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoadingComments(false); // stop loading
    }
  };
  
  
  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments(id);   // ✅ Pass `id` here (which is the post id)
    }
    setShowComments(!showComments);
  };
  

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Type something to post your comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await axios.post(`${BASE_URL}/api/createcomment`, {
        job_id: id,
        content: newComment,
        author_id: user?.id,
      }, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      setCommentList((prev) => [...prev, {
        ...res.data.comment,
        User: {
          id: user?.id,
          name: user?.name
        }
      }]);
      
      setNewComment("");
      toast({
        title: "Comment posted",
      });
    } catch (error) {
      console.error("Failed to post comment", error);
      toast({
        title: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-worklink-100 flex items-center justify-center text-worklink-700 font-semibold border border-worklink-200">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                author.name.charAt(0)
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{author.name}</h3>
              <p className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</p>
            </div>
          </div>

          {isOwnPost && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleEdit}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <p className="text-gray-700 whitespace-pre-line">{content}</p>
        {imageUrl && (
          <div className="mt-3">
            <img src={imageUrl} alt="Post image" className="rounded-md max-h-96 w-full object-cover" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t flex flex-col">
        <div className="flex space-x-4 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center space-x-1 ${isLiked ? 'text-blue-600' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp size={18} />
            <span>{likeCount}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center space-x-1" 
            onClick={handleToggleComments}
          >
            <MessageSquare size={18} />
            <span>{showComments ? commentList.length : comments}</span>

          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-2">
            {loadingComments ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : (
              <>
                {commentList.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {commentList.map((c) => (
                      <div key={c.id} className="border-b pb-2">
                        <p className="text-sm font-semibold">{c.User?.name || "Unknown"}</p> {/* ✅ */}
                        <p className="text-sm text-gray-600">{c.content}</p>
                        <p className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Add comment */}
            <div className="mt-3">
              <Textarea 
                rows={2} 
                placeholder="Write a comment..." 
                className="resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  onClick={handleSubmitComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
