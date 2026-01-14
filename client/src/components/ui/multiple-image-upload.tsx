import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { uploadMultipleToCloudinary, validateFile, type CloudinaryUploadResult } from '@/lib/cloudinary';
import { Upload, X, Image as ImageIcon, Video, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  acceptedFormats?: 'image' | 'document' | 'video' | 'all';
}

const getAcceptedFileTypes = (acceptedFormats: 'image' | 'document' | 'video' | 'all') => {
  switch (acceptedFormats) {
    case 'image':
      return {
        accept: 'image/*',
        types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      };
    case 'document':
      return {
        accept: '.pdf,.doc,.docx,.txt,.rtf',
        types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf']
      };
    case 'video':
      return {
        accept: 'video/*',
        types: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        extensions: ['.mp4', '.avi', '.mov', '.wmv']
      };
    case 'all':
    default:
      return {
        accept: 'image/*,.pdf,.doc,.docx,.txt,.rtf,video/*',
        types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.rtf', '.mp4', '.avi', '.mov', '.wmv']
      };
  }
};

export function MultipleImageUpload({
  value = [],
  onChange,
  onError,
  folder = 'uploads',
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  className,
  label = 'Upload Images',
  description,
  disabled = false,
  acceptedFormats = 'image',
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>(value);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileConfig = getAcceptedFileTypes(acceptedFormats);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);

    if (value.length + files.length > maxFiles) {
      const errorMsg = `You can only upload up to ${maxFiles} files. Currently: ${value.length}, trying to add: ${files.length}`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      const validation = validateFile(file, {
        maxSize,
        allowedTypes: fileConfig.types,
        allowedExtensions: fileConfig.extensions
      });

      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        onError?.(validation.error || 'Invalid file');
        return;
      }

      validFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [maxSize, maxFiles, value.length, onError, fileConfig]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      console.warn('⚠️ No files selected to upload');
      return;
    }

    console.log(`🚀 Starting upload of ${selectedFiles.length} files...`);
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      console.log('📤 Calling uploadMultipleToCloudinary...');
      const results: CloudinaryUploadResult[] = await uploadMultipleToCloudinary(selectedFiles, {
        folder,
        resourceType: 'auto'
      });

      console.log('✅ Upload complete! Results:', results.length);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(100);

      const urls = results.map(r => r.secure_url);
      console.log('📝 Updating form with URLs:', urls);
      onChange([...value, ...urls]);
      setPreviews(prev => {
        const uploadedCount = selectedFiles.length;
        return [...prev.slice(0, -uploadedCount), ...urls];
      });

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err: any) {
      console.error('❌ Upload failed:', err);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      setPreviews(prev => prev.slice(0, value.length));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFiles, folder, onChange, value, onError]);

  const handleRemove = useCallback((index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleRemoveSelected = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(prev => {
      const uploadedCount = value.length;
      const selectedIndex = uploadedCount + index;
      return prev.filter((_, i) => i !== selectedIndex);
    });
  }, [selectedFiles, value.length]);

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label htmlFor="multiple-file-upload" className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            ref={fileInputRef}
            id="multiple-file-upload"
            type="file"
            accept={fileConfig.accept}
            multiple
            onChange={handleFileSelect}
            disabled={disabled || isUploading || value.length >= maxFiles}
            className="flex-1"
            data-testid="input-multiple-file-upload"
          />
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || disabled}
              className="w-full sm:w-auto"
              data-testid="button-upload-multiple-files"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Image' : 'Images'}`}
            </Button>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'}... {uploadProgress}%
            </p>
          </div>
        )}

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => {
              const isUploaded = index < value.length;
              return (
                <div key={index} className="relative group">
                  <div className="relative border rounded-lg overflow-hidden bg-muted/50 aspect-square flex items-center justify-center">
                    {(() => {
                      const isVideo = preview.match(/\.(mp4|avi|mov|wmv)$/i) || preview.startsWith('data:video/');
                      const isPdf = preview.match(/\.pdf$/i) || preview.startsWith('data:application/pdf');
                      const isDoc = preview.match(/\.(doc|docx|txt|rtf)$/i) || preview.startsWith('data:application/') || preview.startsWith('data:text/');

                      if (isVideo) {
                        return (
                          <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full bg-black/5">
                            <Video className="w-10 h-10 mb-2" />
                            <span className="text-xs max-w-[90%] truncate px-2">{isUploaded ? 'Video Uploaded' : 'Video Preview'}</span>
                          </div>
                        );
                      } else if (isPdf || isDoc) {
                        return (
                          <div className="flex flex-col items-center justify-center text-muted-foreground w-full h-full bg-black/5">
                            <FileText className="w-10 h-10 mb-2" />
                            <span className="text-xs max-w-[90%] truncate px-2">Document</span>
                          </div>
                        );
                      } else {
                        // Default to image
                        return (
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                    })()}

                    {!isUploaded && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                          Pending
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => isUploaded ? handleRemove(index) : handleRemoveSelected(index - value.length)}
                    disabled={disabled || isUploading}
                    data-testid={`button-remove-image-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Supported formats: {fileConfig.extensions.join(', ').toUpperCase()} • Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB per file</span>
          <span>{value.length}/{maxFiles} files</span>
        </div>
      </div>
    </div>
  );
}
