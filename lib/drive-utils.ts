/**
 * Google Drive Link Converter Utility
 * Converts standard Google Drive sharing URLs to direct streaming and download links
 */

export interface DriveLinks {
  embedUrl: string
  downloadUrl: string
  fileId: string
}

/**
 * Extracts file ID from Google Drive URL
 */
export function extractDriveId(url: string): string | null {
  // Handle various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/FILE_ID/view
    /id=([a-zA-Z0-9_-]+)/,         // ?id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)\//,     // /d/FILE_ID/
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/ // drive.google.com/open?id=FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts Google Drive sharing URL to embed and download links
 */
export function convertDriveLink(sharingUrl: string): DriveLinks | null {
  const fileId = extractDriveId(sharingUrl);
  
  if (!fileId) {
    console.error('Invalid Google Drive URL format');
    return null;
  }

  // Embed URL for iframe
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  
  // Direct download URL
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  return {
    embedUrl,
    downloadUrl,
    fileId
  };
}

/**
 * Validates if a URL is a Google Drive sharing URL
 */
export function isValidDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') && extractDriveId(url) !== null;
}

/**
 * Creates a thumbnail URL from Google Drive file ID
 */
export function createThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}
