import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MoreHorizontal, Reply, Flag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    level: string;
  };
  timestamp: string;
  likes: number;
  isLikedByUser: boolean;
  replies?: Comment[];
}

interface CommentsSectionProps {
  blogPostId: string;
  comments?: Comment[];
  currentUser?: {
    name: string;
    avatar?: string;
  };
  onAddComment?: (content: string, parentId?: string) => void;
  onReportComment?: (commentId: string) => void;
}

export default function CommentsSection({ 
  blogPostId,
  comments: propComments, 
  currentUser, 
  onAddComment, 
  onReportComment 
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Fetch comments from API
  const { data: fetchedComments, isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/blogs', blogPostId, 'comments'],
    enabled: !!blogPostId
  });

  // Use fetched comments if available, otherwise use prop comments
  const comments = fetchedComments || propComments || [];

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest('POST', `/api/comments/${commentId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogPostId, 'comments'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like the comment",
        variant: "destructive",
      });
    },
  });

  const unlikeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiRequest('DELETE', `/api/comments/${commentId}/like`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogPostId, 'comments'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unlike the comment",
        variant: "destructive",
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', `/api/blogs/${blogPostId}/comments`, {
        content
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogPostId, 'comments'] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async ({ content, parentCommentId }: { content: string; parentCommentId: string }) => {
      const res = await apiRequest('POST', `/api/blogs/${blogPostId}/comments`, {
        content,
        parentCommentId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogPostId, 'comments'] });
      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "Success",
        description: "Reply added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add a comment",
        variant: "destructive",
      });
      return;
    }
    
    if (onAddComment) {
      onAddComment(newComment);
    } else {
      createCommentMutation.mutate(newComment);
    }
    setNewComment("");
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add a reply",
        variant: "destructive",
      });
      return;
    }
    
    if (onAddComment) {
      onAddComment(replyContent, parentId);
    } else {
      createReplyMutation.mutate({ content: replyContent, parentCommentId: parentId });
    }
  };

  const handleLike = (comment: Comment) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to like comments",
        variant: "destructive",
      });
      return;
    }

    if (comment.isLikedByUser) {
      unlikeCommentMutation.mutate(comment.id);
    } else {
      likeCommentMutation.mutate(comment.id);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isLiked = comment.isLikedByUser;
    const isPending = likeCommentMutation.isPending || unlikeCommentMutation.isPending;

    return (
      <div className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm" data-testid={`comment-author-${comment.id}`}>
                {comment.author.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {comment.author.level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(comment.timestamp)}
              </span>
            </div>

            {/* Comment Content */}
            <p className="text-sm leading-relaxed" data-testid={`comment-content-${comment.id}`}>
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1 h-auto p-1 ${isLiked ? 'text-red-500' : ''}`}
                onClick={() => handleLike(comment)}
                disabled={isPending}
                data-testid={`button-like-${comment.id}`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{comment.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-auto p-1"
                onClick={() => setReplyingTo(comment.id)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3 w-3" />
                <span className="text-xs">Reply</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1" data-testid={`button-more-${comment.id}`}>
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReportComment?.(comment.id)}>
                    <Flag className="mr-2 h-3 w-3" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && currentUser && (
              <div className="flex gap-2 mt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="text-xs">{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={`Reply to ${comment.author.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-16 text-sm"
                    data-testid={`textarea-reply-${comment.id}`}
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim()}
                      data-testid={`button-submit-reply-${comment.id}`}
                    >
                      Reply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      data-testid={`button-cancel-reply-${comment.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load comments. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {currentUser && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a thoughtful comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-20"
                  data-testid="textarea-new-comment"
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    data-testid="button-submit-comment"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}