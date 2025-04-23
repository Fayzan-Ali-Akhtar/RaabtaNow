
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, MessageSquare } from 'lucide-react';

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
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const { toast } = useToast();

  const handleLike = () => {
    // In a real app, this would call an API
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "Post unliked" : "Post liked",
      duration: 1500,
    });
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id);
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
              <p className="text-xs text-gray-500">{timestamp}</p>
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
      
      <CardFooter className="pt-3 border-t flex justify-between">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center space-x-1 ${isLiked ? 'text-worklink-600' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp size={18} />
            <span>{likeCount}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-1">
            <MessageSquare size={18} />
            <span>{comments}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
