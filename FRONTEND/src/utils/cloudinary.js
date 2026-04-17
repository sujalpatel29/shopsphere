/**
 * Cloudinary Upload Utility
 * 
 * Provides functions to upload images to Cloudinary from external URLs.
 * Uses unsigned uploads with a preset for client-side uploads.
 * 
 * IMPORTANT: Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
 * in your .env file before deploying.
 */

// Cloudinary configuration from environment
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_unsigned_preset";

/**
 * Upload an image to Cloudinary from a URL
 * @param {string} imageUrl - The external URL of the image to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Optional folder path in Cloudinary
 * @param {string} options.publicId - Optional custom public ID
 * @returns {Promise<Object>} - Upload result with secure_url, public_id, etc.
 */
export async function uploadImageToCloudinary(imageUrl, options = {}) {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  if (CLOUD_NAME === "your_cloud_name" || UPLOAD_PRESET === "your_unsigned_preset") {
    console.warn("⚠️ Cloudinary credentials not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
    // Return the original URL as fallback
    return { 
      secure_url: imageUrl, 
      public_id: null,
      fallback: true,
      warning: "Using original URL - Cloudinary not configured"
    };
  }

  const formData = new FormData();
  formData.append("file", imageUrl);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  if (options.folder) {
    formData.append("folder", options.folder);
  }
  
  if (options.publicId) {
    formData.append("public_id", options.publicId);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Return original URL as fallback
    return { 
      secure_url: imageUrl, 
      public_id: null,
      fallback: true,
      error: error.message
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {string[]} imageUrls - Array of external image URLs
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} - Array of upload results
 */
export async function uploadMultipleImages(imageUrls, options = {}) {
  if (!Array.isArray(imageUrls)) {
    throw new Error("imageUrls must be an array");
  }

  const results = await Promise.allSettled(
    imageUrls.map(url => uploadImageToCloudinary(url, options))
  );

  return results.map((result, index) => ({
    originalUrl: imageUrls[index],
    ...(result.status === "fulfilled" 
      ? result.value 
      : { error: result.reason?.message, secure_url: imageUrls[index], fallback: true }
    ),
  }));
}

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean}
 */
export function isCloudinaryConfigured() {
  return CLOUD_NAME !== "your_cloud_name" && 
         UPLOAD_PRESET !== "your_unsigned_preset" &&
         Boolean(CLOUD_NAME) && 
         Boolean(UPLOAD_PRESET);
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} url - The Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    fit = "fill",
  } = options;

  const transforms = [];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${fit}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);

  if (transforms.length === 0) return url;

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

export default {
  uploadImageToCloudinary,
  uploadMultipleImages,
  isCloudinaryConfigured,
  getOptimizedImageUrl,
};
