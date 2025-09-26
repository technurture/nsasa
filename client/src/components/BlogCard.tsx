import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";
import { useState } from "react";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: {
      name: string;
      avatar?: string;
      level: string;
    };
    category: string;
    publishedAt: string;
    readTime: number;
    likes: number;
    comments: number;
    views: number;
    image?: string;
    tags: string[];
  };
  onReadMore?: (id: string) => void;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
}

export default function BlogCard({ blog, onReadMore, onLike, onComment, onShare, onBookmark }: BlogCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(blog.id);
    console.log(`${isLiked ? 'Unliked' : 'Liked'} blog: ${blog.title}`);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(blog.id);
    console.log(`${isBookmarked ? 'Unbookmarked' : 'Bookmarked'} blog: ${blog.title}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      {/* Blog Image */}
      {blog.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={blog.image} 
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardHeader className="space-y-4">
        {/* Category and Read Time */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" data-testid={`badge-category-${blog.id}`}>
            {blog.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span data-testid={`text-views-${blog.id}`}>{blog.views}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground line-clamp-3" data-testid={`text-excerpt-${blog.id}`}>
          {blog.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {blog.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={blog.author.avatar} />
            <AvatarFallback>{blog.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm" data-testid={`text-author-${blog.id}`}>
              {blog.author.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {blog.author.level} • {formatDate(blog.publishedAt)} • {blog.readTime} min read
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        {/* Engagement Actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-1 ${isLiked ? 'text-red-500' : ''}`}
            onClick={handleLike}
            data-testid={`button-like-${blog.id}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{blog.likes + (isLiked ? 1 : 0)}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => onComment?.(blog.id)}
            data-testid={`button-comment-${blog.id}`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{blog.comments}</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onShare?.(blog.id)}
            data-testid={`button-share-${blog.id}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className={isBookmarked ? 'text-primary' : ''}
            onClick={handleBookmark}
            data-testid={`button-bookmark-${blog.id}`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>

          <Button 
            size="sm"
            onClick={() => onReadMore?.(blog.id)}
            data-testid={`button-read-more-${blog.id}`}
          >
            Read More
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}