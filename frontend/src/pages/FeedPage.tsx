
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PostCard } from '@/components/ui/post-card';
import MainLayout from '@/components/layout/MainLayout';

// Sample posts data (in a real app, this would come from an API)
const initialPosts = [
  {
    id: '1',
    author: { id: '101', name: 'Jane Smith' },
    content: 'Just completed a certification in UX design! Looking forward to applying these skills in my next role. #UXDesign #CareerGrowth',
    likes: 12,
    comments: 5,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: { id: '102', name: 'Alex Johnson' },
    content: "Excited to share that I've accepted a position as Senior Developer at TechCorp! Thanks to everyone who supported me during my job search. The WorkLink AI cover letter generator was a game-changer!",
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&w=800&h=400',
    likes: 47,
    comments: 23,
    timestamp: '1 day ago'
  },
  {
    id: '3',
    author: { id: 'current-user', name: 'Current User' },
    content: 'Has anyone used the AI cover letter feature for a marketing position? Would love to hear your experiences!',
    likes: 3,
    comments: 8,
    timestamp: '3 days ago'
  }
];

const FeedPage = () => {
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState(initialPosts);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would call an API to create the post
    setTimeout(() => {
      const newPost = {
        id: `new-${Date.now()}`,
        author: { id: 'current-user', name: 'Current User' },
        content: newPostContent,
        likes: 0,
        comments: 0,
        timestamp: 'Just now'
      };
      
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setIsSubmitting(false);
      
      toast({
        title: "Post created",
        description: "Your post has been published to the feed."
      });
    }, 1000);
  };

  const handleEditPost = (postId: string) => {
    // In a real app, this would open an edit form or modal
    console.log(`Edit post ${postId}`);
    toast({
      title: "Edit post",
      description: "Post editing would open here."
    });
  };

  const handleDeletePost = (postId: string) => {
    // In a real app, this would call an API to delete the post
    setPosts(posts.filter(post => post.id !== postId));
    toast({
      title: "Post deleted",
      description: "Your post has been removed from the feed."
    });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        
        {/* New Post Form */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <form onSubmit={handlePostSubmit}>
            <Textarea
              placeholder="What's on your mind?"
              className="resize-none mb-4"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div>
                {/* File upload button would go here */}
                <Button type="button" variant="outline" size="sm" disabled>
                  Add Image
                </Button>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Posts Feed */}
        <div>
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              author={post.author}
              content={post.content}
              imageUrl={post.imageUrl}
              likes={post.likes}
              comments={post.comments}
              timestamp={post.timestamp}
              isOwnPost={post.author.id === 'current-user'}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FeedPage;
