import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import { downloadFile } from "@/lib/cloudinary";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
  title?: string;
}

export default function FilePreviewModal({
  open,
  onOpenChange,
  fileUrl,
  fileName,
  fileType,
  title
}: FilePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFile(fileUrl, fileName);
      toast({
        title: "Download Complete",
        description: `${fileName} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const renderPreview = () => {
    // PDF files
    if (fileType === 'pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <div className="w-full h-[70vh] bg-muted rounded-md overflow-hidden">
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title={title || fileName}
            data-testid="pdf-preview"
          />
        </div>
      );
    }

    // Image files
    if (fileType === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) {
      return (
        <div className="w-full max-h-[70vh] flex items-center justify-center bg-muted rounded-md overflow-hidden">
          <img
            src={fileUrl}
            alt={title || fileName}
            className="max-w-full max-h-[70vh] object-contain"
            data-testid="image-preview"
          />
        </div>
      );
    }

    // Video files
    if (fileType === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(fileName)) {
      return (
        <div className="w-full bg-muted rounded-md overflow-hidden">
          <video
            src={fileUrl}
            controls
            className="w-full h-auto"
            data-testid="video-preview"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // For other document types (Word, Excel, etc.)
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-muted rounded-md p-8 text-center">
        <div className="space-y-4 max-w-md">
          <p className="text-lg font-medium">Preview Not Available</p>
          <p className="text-sm text-muted-foreground">
            This file type cannot be previewed in the browser. 
            You can download it or open it in a new tab.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              data-testid="preview-download-button"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download File'}
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenInNewTab}
              data-testid="preview-open-button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold flex-1">
            {title || fileName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
              data-testid="header-download-button"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              data-testid="close-preview-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
