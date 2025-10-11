import path from 'path';

/**
 * File magic numbers (signatures) for validation
 */
const FILE_SIGNATURES = {
  PDF: {
    signature: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    mimeTypes: ['application/pdf'],
  },
  DOCX: {
    signature: Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK (ZIP)
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ],
  },
};

/**
 * Suspicious patterns that might indicate malicious content
 */
const SUSPICIOUS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
  /on\w+\s*=/i, // Event handlers like onclick=
  /eval\s*\(/i,
  /exec\s*\(/i,
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Validates file magic number (signature)
 */
function validateMagicNumber(buffer: Buffer, fileType: 'PDF' | 'DOCX'): boolean {
  const signature = FILE_SIGNATURES[fileType].signature;
  const fileStart = buffer.slice(0, signature.length);
  return fileStart.equals(signature);
}

/**
 * Sanitizes filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = path.basename(filename);
  
  // Remove special characters except dots, dashes, and underscores
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length to 255 characters
  return sanitized.slice(0, 255);
}

/**
 * Validates file size
 */
function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): FileValidationResult {
  if (size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  if (size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File too large. Maximum size is ${maxMB}MB` };
  }
  
  return { valid: true };
}

/**
 * Scans file content for suspicious patterns
 */
function scanForSuspiciousContent(buffer: Buffer): string[] {
  const warnings: string[] = [];
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000)); // Check first 10KB
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }
  
  return warnings;
}

/**
 * Comprehensive file validation
 * 
 * SECURITY NOTE: DOCX validation provides reasonable protection but is not perfect.
 * Known limitations:
 * - DOCX structure checks search for marker strings which can be spoofed
 * - ZIP bomb detection is heuristic-based (entry count) not compression-ratio based
 * - Perfect protection requires a dedicated ZIP parsing library (yauzl, fflate)
 * 
 * Current mitigations:
 * - 2MB size limit for DOCX files (reduces attack surface)
 * - 10-second timeout protection on extraction (prevents resource exhaustion)
 * - Structure validation (reduces non-DOCX archives)
 * - Macro rejection
 * 
 * Post-launch improvement: Add proper ZIP parsing library for full ZIP bomb protection
 */
export function validateResumeFile(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  options: { maxSize?: number; strictValidation?: boolean } = {}
): FileValidationResult {
  const { maxSize = 10 * 1024 * 1024, strictValidation = true } = options;
  
  // Stricter size limit for DOCX files (ZIP-based) to reduce ZIP bomb attack surface
  const isDOCXMime = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      mimeType === 'application/msword';
  const effectiveMaxSize = isDOCXMime ? Math.min(maxSize, 2 * 1024 * 1024) : maxSize; // 2MB max for DOCX
  const warnings: string[] = [];
  
  // 1. Validate file size (stricter for DOCX)
  const sizeValidation = validateFileSize(buffer.length, effectiveMaxSize);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }
  
  // 2. Validate mime type is supported
  const isPDF = mimeType === 'application/pdf';
  const isDOCX = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 mimeType === 'application/msword';
  
  if (!isPDF && !isDOCX) {
    return {
      valid: false,
      error: 'Unsupported file format. Only PDF and DOCX files are allowed',
    };
  }
  
  // 3. Validate magic number matches mime type
  const fileType: 'PDF' | 'DOCX' = isPDF ? 'PDF' : 'DOCX';
  const magicNumberValid = validateMagicNumber(buffer, fileType);
  
  if (!magicNumberValid) {
    if (strictValidation) {
      return {
        valid: false,
        error: 'File signature does not match extension. File may be corrupted or malicious',
      };
    } else {
      warnings.push('File signature mismatch - proceeding with caution');
    }
  }
  
  // 4. Validate filename
  const sanitized = sanitizeFilename(filename);
  if (sanitized !== filename) {
    warnings.push('Filename was sanitized to remove potentially unsafe characters');
  }
  
  // 5. Scan for suspicious content (for text-based files)
  const contentWarnings = scanForSuspiciousContent(buffer);
  warnings.push(...contentWarnings);
  
  // 6. Additional PDF-specific validation
  if (isPDF) {
    // Check for PDF header
    const header = buffer.toString('utf-8', 0, 5);
    if (!header.startsWith('%PDF-')) {
      return {
        valid: false,
        error: 'Invalid PDF file format',
      };
    }
    
    // Check for PDF trailer (EOF marker should exist)
    const trailer = buffer.toString('utf-8', Math.max(0, buffer.length - 1024));
    if (!trailer.includes('%%EOF')) {
      warnings.push('PDF may be truncated or corrupted');
    }
  }
  
  // 7. Additional DOCX-specific validation
  if (isDOCX) {
    // DOCX is a ZIP file - verify ZIP structure
    const zipHeader = buffer.slice(0, 4);
    const expectedZipHeader = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    
    if (!zipHeader.equals(expectedZipHeader)) {
      return {
        valid: false,
        error: 'Invalid DOCX file format',
      };
    }
    
    // Verify DOCX-specific markers to prevent ZIP bombs and arbitrary ZIPs
    const bufferStr = buffer.toString('binary');
    
    // Must contain DOCX-specific content types file
    if (!bufferStr.includes('[Content_Types].xml')) {
      return {
        valid: false,
        error: 'Invalid DOCX structure - missing Content Types',
      };
    }
    
    // Must contain word document structure
    if (!bufferStr.includes('word/document.xml')) {
      return {
        valid: false,
        error: 'Invalid DOCX structure - missing document content',
      };
    }
    
    // Reject macro-enabled documents (.docm)
    if (bufferStr.includes('vbaProject.bin') || bufferStr.includes('macroEnabled')) {
      return {
        valid: false,
        error: 'Macro-enabled documents are not supported for security reasons',
      };
    }
    
    // Basic ZIP bomb protection: check compression ratio
    // Count compressed entries to estimate decompression size
    const entryCount = (bufferStr.match(/PK\x03\x04/g) || []).length;
    if (entryCount > 100) {
      warnings.push('Document has unusually high number of entries');
    }
    
    // Check for suspiciously small file with many entries (potential bomb)
    if (buffer.length < 50000 && entryCount > 50) {
      return {
        valid: false,
        error: 'File structure suggests potential ZIP bomb',
      };
    }
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates file extension against mime type
 */
export function validateFileExtension(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  
  if (mimeType === 'application/pdf') {
    return ext === '.pdf';
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return ext === '.docx';
  }
  
  if (mimeType === 'application/msword') {
    return ext === '.doc';
  }
  
  return false;
}
