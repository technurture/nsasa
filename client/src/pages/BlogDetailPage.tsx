import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {  ArrowLeft, Calendar, Clock, Eye, Heart, MessageCircle, Share2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import CommentsSection from "@/components/CommentsSection";
import BlogEngagementDialog from "@/components/BlogEngagementDialog";
import type { BlogPost } from "@shared/mongoSchema";

export default function BlogDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const blogId = params.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showViewsDialog, setShowViewsDialog] = useState(false);

  const { data: blog, isLoading, error } = useQuery<any>({
    queryKey: ['/api/blogs', blogId],
    queryFn: async () => {
      const response = await fetch(`/api/blogs/${blogId}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      return response.json();
    },
    enabled: !!blogId
  });

  useEffect(() => {
    if (blog) {
      setIsLiked(blog.isLikedByUser || false);
      setLikesCount(blog.likes || 0);
    }
  }, [blog]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/blogs/${blogId}/like`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsLiked(true);
      setLikesCount(data.likesCount || likesCount + 1);
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogId] });
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
      const res = await apiRequest('DELETE', `/api/blogs/${blogId}/like`);
      return await res.json();
    },
    onSuccess: (data) => {
      setIsLiked(false);
      setLikesCount(data.likesCount || likesCount - 1);
      queryClient.invalidateQueries({ queryKey: ['/api/blogs', blogId] });
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load blog post. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Blog post not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const displayImage = blog.imageUrl || (blog.imageUrls && blog.imageUrls.length > 0 ? blog.imageUrls[0] : undefined);
  
  const galleryImages = blog.imageUrl 
    ? (blog.imageUrls || [])
    : (blog.imageUrls && blog.imageUrls.length > 1 ? blog.imageUrls.slice(1) : []);
  
  const allImages = [displayImage, ...galleryImages].filter(Boolean);
  
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };
  
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageIndex(null);
  };
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
    } else {
      setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/blogs')}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Button>

        {/* Blog Header */}
        <article>
          {/* Featured Image */}
          {displayImage && (
            <div 
              className="aspect-video w-full overflow-hidden rounded-md mb-8 cursor-pointer hover-elevate"
              onClick={() => openImageModal(0)}
              data-testid="img-featured-container"
            >
              <img 
                src={displayImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
                data-testid="img-featured"
              />
            </div>
          )}

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" data-testid="badge-category">
              {blog.category}
            </Badge>
            {blog.tags && blog.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6" data-testid="heading-title">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={blog.authorAvatar} />
                <AvatarFallback>
                  {blog.authorName ? blog.authorName.charAt(0) : 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium" data-testid="text-author">
                  {blog.authorName || 'Unknown Author'}
                </p>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(blog.createdAt)}</span>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{blog.readTime} min read</span>
            </div>

            {/* Views */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewsDialog(true);
              }}
              className="flex items-center gap-2 text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors"
              data-testid="button-views-detail"
            >
              <Eye className="h-4 w-4" />
              <span className="text-sm" data-testid="text-views">{blog.views}</span>
            </button>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 italic" data-testid="text-excerpt">
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            data-testid="content-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Additional Images Gallery - Swipeable Carousel */}
          {galleryImages.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Gallery</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {galleryImages.map((imageUrl: string, index: number) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <Card 
                        className="overflow-hidden hover-elevate transition-all cursor-pointer border-0"
                        onClick={() => openImageModal(index + 1)}
                        data-testid={`img-gallery-slide-${index}`}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={imageUrl} 
                            alt={`${blog.title} - Image ${index + 2}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious 
                  className="hidden sm:flex -left-12" 
                  data-testid="button-gallery-prev"
                />
                <CarouselNext 
                  className="hidden sm:flex -right-12" 
                  data-testid="button-gallery-next"
                />
              </Carousel>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Swipe or use arrows to view more images • Click any image to view full size
              </p>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center gap-4 py-8 border-t border-b">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLikesDialog(true);
                }}
                className="text-sm"
                data-testid="button-likes-count-detail"
              >
                {likesCount}
              </button>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-comment"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{blog.commentCount || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-share"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection resourceType="blog" resourceId={blogId!} />
          </div>
        </article>
      </div>
      
      {/* Full Screen Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeImageModal}
              data-testid="button-close-modal"
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateImage('prev')}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateImage('next')}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
            
            {/* Image Display */}
            {selectedImageIndex !== null && allImages[selectedImageIndex] && (
              <div className="w-full h-full flex items-center justify-center p-12">
                <img
                  src={allImages[selectedImageIndex]}
                  alt={`${blog.title} - Full size`}
                  className="max-w-full max-h-full object-contain"
                  data-testid="img-modal-display"
                />
              </div>
            )}
            
            {/* Image Counter */}
            {allImages.length > 1 && selectedImageIndex !== null && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-md">
                <span className="text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <BlogEngagementDialog
        open={showLikesDialog}
        onOpenChange={setShowLikesDialog}
        blogId={blogId!}
        type="likes"
      />
      
      <BlogEngagementDialog
        open={showViewsDialog}
        onOpenChange={setShowViewsDialog}
        blogId={blogId!}
        type="views"
      />
    </div>
  );
}
