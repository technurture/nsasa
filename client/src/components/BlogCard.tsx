import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
    imageUrl?: string;
    imageUrls?: string[];
    tags: string[];
  };
  onReadMore?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isLikedByUser?: boolean;
}

export default function BlogCard({ blog, onReadMore, onComment, onShare, onBookmark, isLikedByUser = false }: BlogCardProps) {
  const [isLiked, setIsLiked] = useState(isLikedByUser);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Sync with server state when prop changes
  useEffect(() => {
    setIsLiked(isLikedByUser);
  }, [isLikedByUser]);

  // Sync likes count when it changes
  useEffect(() => {
    setLikesCount(blog.likes);
  }, [blog.likes]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/blogs/${blog.id}/like`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsLiked(true);
      setLikesCount(data.likesCount || likesCount + 1);
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like the blog post",
        variant: "destructive",
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/blogs/${blog.id}/like`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsLiked(false);
      setLikesCount(data.likesCount || likesCount - 1);
      queryClient.invalidateQueries({ queryKey: ['/api/blogs'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unlike the blog post",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to like blog posts",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(blog.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const displayImage = blog.imageUrl || (blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : undefined);
  
  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      {/* Blog Image */}
      {displayImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={displayImage} 
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
            disabled={likeMutation.isPending || unlikeMutation.isPending}
            data-testid={`button-like-${blog.id}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
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