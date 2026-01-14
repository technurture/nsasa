import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, Eye, Video } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import BlogEngagementDialog from "@/components/BlogEngagementDialog";

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
  disableEngagementDialogs?: boolean;
}

export default function BlogCard({ blog, onReadMore, onComment, onShare, onBookmark, isLikedByUser = false, disableEngagementDialogs = false }: BlogCardProps) {
  const [isLiked, setIsLiked] = useState(isLikedByUser);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showViewsDialog, setShowViewsDialog] = useState(false);
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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(blog.id);
      return;
    }

    try {
      const url = `${window.location.origin}/blogs/${blog.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Blog post link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
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

  const displayImage = blog.imageUrl || (blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : undefined);
  const placeholderImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.title)}&size=800&background=random&bold=true&format=svg`;

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      {/* Blog Image */}
      <div className="aspect-video w-full overflow-hidden bg-muted relative group">
        {(displayImage && (displayImage.match(/\.(mp4|avi|mov|wmv)$/i) || displayImage.includes('/video/'))) ? (
          <div className="w-full h-full flex items-center justify-center bg-black/10">
            <video
              src={displayImage}
              className="w-full h-full object-cover"
              muted
              playsInline
              onMouseOver={(e) => e.currentTarget.play()}
              onMouseOut={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full pointer-events-none">
              <Video className="w-4 h-4" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={displayImage || placeholderImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>

      <CardHeader className="space-y-4">
        {/* Category and Read Time */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" data-testid={`badge-category-${blog.id}`}>
            {blog.category}
          </Badge>
          {disableEngagementDialogs ? (
            <div className="flex items-center gap-1 text-sm text-muted-foreground px-2 py-1 rounded-md">
              <Eye className="h-3 w-3" />
              <span data-testid={`text-views-${blog.id}`}>{blog.views}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowViewsDialog(true)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors"
              data-testid={`button-views-${blog.id}`}
            >
              <Eye className="h-3 w-3" />
              <span data-testid={`text-views-${blog.id}`}>{blog.views}</span>
            </button>
          )}
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
          {(blog.tags || []).slice(0, 3).map((tag, index) => (
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

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-0">
        {/* Engagement Actions */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
              data-testid={`button-like-${blog.id}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            {disableEngagementDialogs ? (
              <span className="text-sm px-2 py-1 -ml-1" data-testid={`text-likes-count-${blog.id}`}>
                {likesCount}
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLikesDialog(true);
                }}
                className="text-sm hover-elevate px-2 py-1 rounded-md -ml-1"
                data-testid={`button-likes-count-${blog.id}`}
              >
                {likesCount}
              </button>
            )}
          </div>

          {disableEngagementDialogs ? (
            <div className="flex items-center gap-1 px-2" data-testid={`text-views-bottom-${blog.id}`}>
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{blog.views}</span>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowViewsDialog(true);
              }}
              data-testid={`button-views-${blog.id}`}
            >
              <Eye className="h-4 w-4" />
              <span>{blog.views}</span>
            </Button>
          )}

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
            onClick={handleShare}
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

          {onReadMore && (
            <Button
              size="sm"
              onClick={() => onReadMore(blog.id)}
              data-testid={`button-read-more-${blog.id}`}
            >
              Read More
            </Button>
          )}
        </div>
      </CardFooter>

      {!disableEngagementDialogs && (
        <>
          <BlogEngagementDialog
            open={showLikesDialog}
            onOpenChange={setShowLikesDialog}
            blogId={blog.id}
            type="likes"
          />

          <BlogEngagementDialog
            open={showViewsDialog}
            onOpenChange={setShowViewsDialog}
            blogId={blog.id}
            type="views"
          />
        </>
      )}
    </Card>
  );
}