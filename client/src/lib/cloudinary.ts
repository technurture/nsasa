
// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

if (!CLOUD_NAME) {
  console.error('⚠️ CRITICAL: Cloudinary Cloud Name not found! Please set VITE_CLOUDINARY_CLOUD_NAME in environment variables.');
} else {
  console.log('✅ Cloudinary Cloud Name configured:', CLOUD_NAME);
}

if (!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
  console.warn('⚠️ Cloudinary Upload Preset not set. Using default: "ml_default". Set VITE_CLOUDINARY_UPLOAD_PRESET for production.');
} else {
  console.log('✅ Cloudinary Upload Preset configured:', UPLOAD_PRESET);
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

/**
 * Upload a file to Cloudinary
 * @param file - The file to upload
 * @param options - Additional upload options
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: File,
  options: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    transformation?: any;
  } = {}
): Promise<CloudinaryUploadResult> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing. Please check environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  // Add optional parameters (only those allowed for unsigned uploads)
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  // Determine the resource type for the URL
  const resourceType = options.resourceType || 'image';

  try {
    console.log(`📤 Uploading to Cloudinary: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorData = await response.json();
        console.error('❌ Cloudinary API error:', errorData);
        errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`;
        
        if (response.status === 400) {
          if (errorData.error?.message?.includes('preset')) {
            errorMessage = 'Upload preset configuration error. Make sure the preset is set to "Unsigned" mode in Cloudinary settings.';
          } else {
            errorMessage = `Invalid upload request: ${errorData.error?.message || 'Please check your file and try again.'}`;
          }
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'Upload preset not configured correctly. Ensure the preset "Nsasa001" is set to "Unsigned" mode in Cloudinary.';
        }
      } catch (parseError) {
        console.error('Error parsing Cloudinary error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result.secure_url);
    return result;
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(error.message || 'Failed to upload file to Cloudinary. Please try again.');
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Promise with array of upload results
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  options: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Get optimized image URL from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param transformations - Image transformations
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string => {
  if (!CLOUD_NAME) {
    return '';
  }

  const params = new URLSearchParams();
  
  if (transformations.width) params.append('w', transformations.width.toString());
  if (transformations.height) params.append('h', transformations.height.toString());
  if (transformations.crop) params.append('c', transformations.crop);
  if (transformations.quality) params.append('q', transformations.quality);
  if (transformations.format) params.append('f', transformations.format);

  const transformString = params.toString() ? `/${params.toString().replace(/&/g, ',')}` : '';
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload${transformString}/${publicId}`;
};

/**
 * Validate file before upload
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { isValid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: `File type not supported. Allowed types: ${allowedExtensions.join(', ')}`
      };
    }
  }

  return { isValid: true };
};

/**
 * Convert a Cloudinary URL to force download with proper filename
 * @param url - Original Cloudinary URL
 * @param filename - Desired filename for download
 * @returns Download URL with fl_attachment flag
 */
export const getDownloadUrl = (url: string, filename?: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // NOTE: For 'raw' resources (PDFs, docs) on specific Cloudinary accounts,
  // the 'fl_attachment' flag triggers 401 Unauthorized errors via unsigned requests.
  // We return the direct URL to ensure the file remains accessible.
  return url;
};

/**
 * Access a file from Cloudinary
 * @param fileUrl - Cloudinary file URL
 * @param fileName - Desired filename for display
 */
export const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    console.log(`📥 Accessing resource: ${fileName}`);
    
    // The 401 Unauthorized error (dvgewacb7) is triggered by the 'fl_attachment' flag
    // on raw files (PDFs) in your specific Cloudinary security configuration.
    
    // We'll use the direct, clean URL which avoids Cloudinary's attachment-forcing 
    // security layer that is causing the 401 error.
    const cleanUrl = fileUrl.replace(/\/upload\/[^\/]*fl_attachment[^\/]*\//, '/upload/');
    console.log('🔗 Access URL:', cleanUrl);

    // Opening in a new tab allows the browser to handle the PDF directly.
    // Use an <a> tag with target="_blank" and rel="noreferrer" to avoid context-sharing issues
    // that sometimes trigger 401s in some browser/environment combinations.
    const link = document.createElement('a');
    link.href = cleanUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
    
    console.log('✅ Resource access initiated');
  } catch (error: any) {
    console.error('❌ Error accessing resource:', error);
    throw error;
  }
};

/**
 * Get preview URL for a file (especially PDFs and documents)
 * For public files, returns the direct URL without attachment flag
 * @param url - Original Cloudinary URL
 * @returns Promise with preview URL
 */
export const getPreviewUrl = async (url: string): Promise<string> => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    // For public files, just return the original URL for preview
    // No attachment flag means it will display in browser instead of downloading
    console.log('✅ Using direct URL for preview (public file)');
    return url;
  } catch (error) {
    console.error('Error generating preview URL:', error);
    // Fallback to original URL
    return url;
  }
};