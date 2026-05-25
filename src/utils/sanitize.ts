/**
 * Converts a user-supplied name into a safe filename.
 *
 * Why this matters: without sanitization a name like "../../../etc/passwd"
 * would produce a file path outside the uploads directory (path traversal).
 * We allow only alphanumerics, hyphens, and underscores so the result is
 * always a flat, predictable filename with no directory components.
 */
export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_') // replace every unsafe char with underscore
    .replace(/_{2,}/g, '_')        // collapse runs of underscores
    .replace(/^_+|_+$/g, '');      // trim leading/trailing underscores
}

export function isValidDisplayName(name: string): boolean {
  const sanitized = sanitizeFilename(name);
  return sanitized.length >= 1 && sanitized.length <= 50;
}
