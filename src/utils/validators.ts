// Allowed MIME types — we check the content type Discord reports for uploads.
// Some clients send "image/jpg" instead of "image/jpeg"; both are listed below.
export const ALLOWED_MEME_MIMETYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

// mp3 can arrive as audio/mpeg or audio/mp3 depending on the client.
export const ALLOWED_SOUND_MIMETYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/vorbis',
]);

export const MAX_MEME_SIZE  = 5 * 1024 * 1024; // 5 MB
export const MAX_SOUND_SIZE = 3 * 1024 * 1024; // 3 MB

// Strip MIME parameters (e.g. "image/jpeg; name=cat.jpg" → "image/jpeg")
export function normalizeContentType(contentType: string): string {
  return contentType.split(';')[0].trim().toLowerCase();
}

export function isAllowedMemeType(mimeType: string): boolean {
  return ALLOWED_MEME_MIMETYPES.has(normalizeContentType(mimeType));
}

export function isAllowedSoundType(mimeType: string): boolean {
  return ALLOWED_SOUND_MIMETYPES.has(normalizeContentType(mimeType));
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
