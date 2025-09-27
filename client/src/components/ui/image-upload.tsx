import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { uploadToCloudinary, validateFile, type CloudinaryUploadResult } from '@/lib/cloudinary';
import { Upload, X, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  className?: string;
  label?: string;
  description?: string;
  required?: boolean;
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

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  } else if (file.type.startsWith('video/')) {
    return <Video className="w-8 h-8 text-purple-500" />;
  } else {
    return <FileText className="w-8 h-8 text-green-500" />;
  }
};

export function ImageUpload({
  value,
  onChange,
  onError,
  folder = 'uploads',
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  label = 'Upload File',
  description,
  required = false,
  disabled = false,
  acceptedFormats = 'all'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileConfig = getAcceptedFileTypes(acceptedFormats);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);

    // Validate file
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

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [maxSize, fileConfig, onError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const resourceType = selectedFile.type.startsWith('image/') 
        ? 'image' 
        : selectedFile.type.startsWith('video/')
        ? 'video'
        : 'raw';

      const result: CloudinaryUploadResult = await uploadToCloudinary(selectedFile, {
        folder,
        resourceType
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange(result.secure_url);
      setPreview(result.secure_url);
      
      // Reset file input
      setSelectedFile(null);
      const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      setError(err.message || 'Upload failed');
      onError?.(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, folder, onChange, onError]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
    onChange('');
    setError(null);
    
    // Reset file input
    const fileInput = document.querySelector(`input[type="file"]`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, [onChange]);

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label htmlFor="file-upload" className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
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
        {/* File Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="file-upload"
            type="file"
            accept={fileConfig.accept}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="flex-1"
            data-testid="input-file-upload"
          />
          {selectedFile && !value && (
            <Button
              onClick={handleUpload}
              disabled={isUploading || disabled}
              className="w-full sm:w-auto"
              data-testid="button-upload-file"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Preview */}
        {(preview || value) && (
          <div className="relative border rounded-lg p-4 bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {selectedFile ? (
                  getFileIcon(selectedFile)
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {selectedFile?.name || 'Uploaded file'}
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Image Preview */}
            {(preview || value) && (preview?.startsWith('data:image') || value?.includes('image') || value?.includes('jpg') || value?.includes('png') || value?.includes('gif') || value?.includes('webp')) && (
              <div className="mt-3">
                <img
                  src={preview || value}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
        )}

        {/* Format Info */}
        <p className="text-xs text-muted-foreground">
          Supported formats: {fileConfig.extensions.join(', ')} • Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
    </div>
  );
}