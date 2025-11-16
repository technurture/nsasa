import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Eye,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  Calendar,
  User,
  Star,
  Heart,
  Send,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
}

interface ResourceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'image' | 'document';
    category: string;
    size: string;
    downloads: number;
    rating: number;
    uploadedBy: string;
    uploadDate: string;
    tags: string[];
    difficulty: '100l' | '200l' | '300l' | '400l';
    thumbnail?: string;
    previewAvailable: boolean;
    fileUrl: string;
    fileName?: string;
  };
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export default function ResourceDetailModal({
  open,
  onOpenChange,
  resource,
  onDownload,
  onPreview,
}: ResourceDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Jane Smith",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      content: "This resource is very helpful! Thanks for sharing.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "2",
      author: "Mike Johnson",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      content: "Great material for understanding the concepts. Would love to see more like this.",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'video': return <Video className="h-5 w-5 text-purple-500" />;
      case 'image': return <ImageIcon className="h-5 w-5 text-green-500" />;
      case 'document': return <BookOpen className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '100l': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '200l': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '300l': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '400l': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return formatDate(timestamp);
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: "You",
      content: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast({
      title: "Success",
      description: "Your comment has been posted",
    });
  };

  const handleDownload = () => {
    // Trigger the actual file download
    const link = document.createElement('a');
    link.href = resource.fileUrl;
    link.download = resource.fileName || resource.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Call the optional download handler (for tracking, etc.)
    onDownload?.(resource.id);
    
    toast({
      title: "Download Started",
      description: `Downloading ${resource.title}`,
    });
  };

  const handlePreview = () => {
    onPreview?.(resource.id);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited 
        ? "Resource removed from your favorites" 
        : "Resource added to your favorites",
    });
  };

  const handleRating = async (rating: number) => {
    setUserRating(rating);
    
    try {
      const response = await fetch(`/api/resources/${resource.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      toast({
        title: "Rating Submitted",
        description: `You rated this resource ${rating} stars`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(resource.type)}
                <Badge variant="secondary" data-testid={`modal-badge-category-${resource.id}`}>
                  {resource.category}
                </Badge>
                <Badge className={getDifficultyColor(resource.difficulty)}>
                  {resource.difficulty}
                </Badge>
              </div>
              <DialogTitle className="text-2xl" data-testid={`modal-title-${resource.id}`}>
                {resource.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span data-testid={`modal-uploader-${resource.id}`}>{resource.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(resource.uploadDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{resource.downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span>{resource.rating.toFixed(1)} rating</span>
                  </div>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-0 pr-4">
          <div className="space-y-6">
            {/* Thumbnail */}
            {resource.thumbnail && (
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img 
                  src={resource.thumbnail} 
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap" data-testid={`modal-description-${resource.id}`}>
                {resource.description}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleDownload} data-testid={`modal-button-download-${resource.id}`}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {resource.previewAvailable && (
                  <Button variant="outline" onClick={handlePreview} data-testid={`modal-button-preview-${resource.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  onClick={handleFavorite}
                  className={isFavorited ? 'text-red-500' : ''}
                  data-testid={`modal-button-favorite-${resource.id}`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rate this resource:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="p-0 border-0 bg-transparent hover:scale-110 transition-transform"
                    data-testid={`modal-star-${star}-${resource.id}`}
                  >
                    <Star 
                      className={`h-5 w-5 ${
                        star <= userRating 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300 hover:text-yellow-400'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Comments ({comments.length})</h3>
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                  data-testid={`modal-input-comment-${resource.id}`}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitComment}
                    data-testid={`modal-button-submit-comment-${resource.id}`}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
