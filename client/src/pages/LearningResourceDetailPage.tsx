import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  User,
  Star,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import CommentsSection from "@/components/CommentsSection";

export default function LearningResourceDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const resourceId = params.id;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const { data: resource, isLoading, error } = useQuery<any>({
    queryKey: ['/api/resources', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/resources/${resourceId}`);
      if (!response.ok) throw new Error('Failed to fetch resource');
      return response.json();
    },
    enabled: !!resourceId
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />;
      case 'image':
        return <ImageIcon className="h-6 w-6 text-green-500" />;
      case 'document':
        return <BookOpen className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '100l':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case '200l':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case '300l':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case '400l':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (size: string | undefined) => {
    return size ? size.toUpperCase() : 'UNKNOWN';
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to download resources",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Record the download
      await fetch(`/api/resources/${resourceId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Start download progress simulation
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Fetch the file from Cloudinary
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resource.fileName || `${resource.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);

      clearInterval(progressInterval);
      setDownloadProgress(100);

      setTimeout(() => {
        setIsDownloading(false);
        toast({
          title: "Download Complete",
          description: `${resource.title} has been downloaded successfully`,
        });
      }, 500);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to preview resources",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Preview",
      description: "Opening preview...",
    });
  };

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to rate resources",
        variant: "destructive",
      });
      return;
    }
    setUserRating(rating);
    toast({
      title: "Rating Submitted",
      description: `You rated this resource ${rating} stars`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: resource?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Resource link copied to clipboard",
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load resource. Please try again later.
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

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Resource not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayImage = resource.thumbnailUrl || (resource.imageUrls && resource.imageUrls.length > 0 ? resource.imageUrls[0] : resource.thumbnail);

  const galleryImages = resource.thumbnailUrl
    ? (resource.imageUrls || [])
    : (resource.imageUrls && resource.imageUrls.length > 1 ? resource.imageUrls.slice(1) : []);

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
          onClick={() => setLocation('/resources')}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>

        {/* Resource Details */}
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
                alt={resource.title}
                className="w-full h-full object-cover"
                data-testid="img-featured"
              />
            </div>
          )}

          {/* Type, Category, and Difficulty */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              {getTypeIcon(resource.type)}
              <Badge variant="secondary" data-testid="badge-category">
                {resource.category}
              </Badge>
            </div>
            <Badge className={getDifficultyColor(resource.difficulty)} data-testid="badge-difficulty">
              {resource.difficulty}
            </Badge>
            {resource.tags && resource.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6" data-testid="heading-title">
            {resource.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b">
            {/* Uploader */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium" data-testid="text-uploader">
                  {resource.uploaderName || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">Uploader</p>
              </div>
            </div>

            {/* Upload Date */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(resource.uploadDate || resource.createdAt)}</span>
            </div>

            {/* File Size */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{formatFileSize(resource.size)}</span>
            </div>

            {/* Downloads */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Download className="h-4 w-4" />
              <span className="text-sm" data-testid="text-downloads">{resource.downloads}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium" data-testid="text-rating">
                {resource.rating ? resource.rating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
              {resource.description}
            </p>
          </div>

          {/* Gallery Images */}
          {galleryImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((imageUrl: string, index: number) => (
                  <div
                    key={index}
                    className="aspect-video overflow-hidden rounded-md cursor-pointer hover-elevate"
                    onClick={() => openImageModal(index + 1)}
                    data-testid={`img-gallery-${index}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${resource.title} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating System */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Rate this Resource</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-0 border-0 bg-transparent hover:scale-110 transition-transform"
                  data-testid={`star-${star}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= userRating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
              {userRating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  You rated: {userRating} stars
                </span>
              )}
            </div>
          </Card>

          {/* Download Progress */}
          {isDownloading && (
            <Card className="p-6 mb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Downloading...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 min-w-[200px]"
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>

            {resource.previewAvailable && (
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex-1 min-w-[200px]"
                data-testid="button-preview"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection resourceType="resource" resourceId={resourceId!} />
          </div>
        </article>

        {/* Full-Screen Image Modal */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                data-testid="button-close-modal"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image Counter */}
              {allImages.length > 1 && selectedImageIndex !== null && (
                <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-md">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 z-50 text-white hover:bg-white/20"
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 z-50 text-white hover:bg-white/20"
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Image */}
              {selectedImageIndex !== null && allImages[selectedImageIndex] && (
                <img
                  src={allImages[selectedImageIndex]}
                  alt={`${resource.title} - Image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  data-testid="img-modal"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
