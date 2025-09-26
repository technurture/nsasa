import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MoreHorizontal, Reply, Flag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentsSectionProps {
  comments: Comment[];
  currentUser?: {
    name: string;
    avatar?: string;
  };
  onAddComment?: (content: string, parentId?: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
}

export default function CommentsSection({ 
  comments, 
  currentUser, 
  onAddComment, 
  onLikeComment, 
  onReportComment 
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment?.(newComment);
    setNewComment("");
    console.log("Comment submitted:", newComment);
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    onAddComment?.(replyContent, parentId);
    setReplyContent("");
    setReplyingTo(null);
    console.log("Reply submitted to:", parentId, replyContent);
  };

  const handleLike = (commentId: string) => {
    const newLikedComments = new Set(likedComments);
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);
    onLikeComment?.(commentId);
    console.log(`${likedComments.has(commentId) ? 'Unliked' : 'Liked'} comment:`, commentId);
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
    const isLiked = likedComments.has(comment.id) || comment.isLiked;
    const likesCount = comment.likes + (likedComments.has(comment.id) && !comment.isLiked ? 1 : 0);

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
                onClick={() => handleLike(comment.id)}
                data-testid={`button-like-${comment.id}`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likesCount}</span>
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