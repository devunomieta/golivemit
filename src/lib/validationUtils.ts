// Security and Validation Utility for GoLive DSS Evidence & Inputs

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export const ALLOWED_EXTENSIONS = [
  'pdf', 'docx', 'doc', 'txt', 'md',
  'csv', 'json', 'log', 'xml',
  'png', 'jpg', 'jpeg'
];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'text/xml',
  'application/xml',
  'image/png',
  'image/jpeg'
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate external evidence URL protocol and structure
 */
export function validateEvidenceUrl(urlStr: string): ValidationResult {
  if (!urlStr || urlStr.trim() === '') {
    return { valid: true };
  }

  const trimmed = urlStr.trim();
  
  // Prevent dangerous protocol schemes like javascript:, data:, vbscript:
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return {
      valid: false,
      error: 'Security alert: Disallowed URL scheme (only http:// and https:// URLs are allowed).',
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Invalid protocol: Verification link must start with http:// or https://',
      };
    }
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Malformed URL format. Please enter a valid web link (e.g. https://jira.company.com/issue/123)',
    };
  }

}

/**
 * Validate file upload size and MIME/extension restrictions
 */
export function validateEvidenceFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Size check (10MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size limit exceeded: Uploaded file is ${sizeMB} MB. Maximum allowed size is 10 MB.`,
    };
  }

  // Extension check
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Disallowed file type (.${ext}). Allowed formats: PDF, DOCX, CSV, JSON, TXT, LOG, PNG, JPG.`,
    };
  }

  // MIME check if browser provides it
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    // Soft check: allow if extension is valid text/log format
    if (!['txt', 'log', 'md', 'csv', 'json', 'xml'].includes(ext)) {
      return {
        valid: false,
        error: `Invalid file MIME type (${file.type}). Upload block enforced for security.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize text comments to strip script and HTML tags
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
