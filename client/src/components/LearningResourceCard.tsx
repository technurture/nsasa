import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Heart
} from "lucide-react";
import { useState } from "react";

interface LearningResourceCardProps {
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
  };
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onFavorite?: (id: string) => void;
}

export default function LearningResourceCard({ 
  resource, 
  onDownload, 
  onPreview, 
  onRate, 
  onFavorite 
}: LearningResourceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userRating, setUserRating] = useState(0);

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

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsDownloading(false);
          onDownload?.(resource.id);
          console.log(`Downloaded resource: ${resource.title}`);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handlePreview = () => {
    onPreview?.(resource.id);
    console.log(`Preview resource: ${resource.title}`);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite?.(resource.id);
    console.log(`${isFavorited ? 'Unfavorited' : 'Favorited'} resource: ${resource.title}`);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate?.(resource.id, rating);
    console.log(`Rated resource ${resource.title}: ${rating} stars`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (size: string) => {
    return size.toUpperCase();
  };

  return (
    <Card className="group overflow-hidden hover-elevate transition-all duration-200">
      {/* Thumbnail/Preview */}
      {resource.thumbnail && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={resource.thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <CardHeader className="space-y-4">
        {/* Type, Category, and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(resource.type)}
            <Badge variant="secondary" data-testid={`badge-category-${resource.id}`}>
              {resource.category}
            </Badge>
          </div>
          <Badge className={getDifficultyColor(resource.difficulty)}>
            {resource.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-description-${resource.id}`}>
          {resource.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{resource.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span data-testid={`text-uploader-${resource.id}`}>{resource.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(resource.uploadDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">Size: {formatFileSize(resource.size)}</span>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span data-testid={`text-downloads-${resource.id}`}>{resource.downloads}</span>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-sm">{resource.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* User Rating */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Rate this:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className="p-0 border-0 bg-transparent hover:scale-110 transition-transform"
              data-testid={`star-${star}-${resource.id}`}
            >
              <Star 
                className={`h-4 w-4 ${
                  star <= userRating 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`} 
              />
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Download Progress */}
        {isDownloading && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Downloading...</span>
              <span>{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
              data-testid={`button-download-${resource.id}`}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleFavorite}
              className={isFavorited ? 'text-red-500' : ''}
              data-testid={`button-favorite-${resource.id}`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {resource.previewAvailable && (
            <Button 
              variant="outline" 
              onClick={handlePreview}
              className="w-full"
              data-testid={`button-preview-${resource.id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}