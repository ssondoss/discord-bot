import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { sanitizeFilename } from '../utils/sanitize';

// Corporate proxies intercept TLS and present their own certificate.
// This agent disables cert verification only for downloading Discord attachments.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

class StorageService {
  private memesDir: string;
  private audioDir: string;

  constructor() {
    this.memesDir = path.join(process.cwd(), 'uploads', 'memes');
    this.audioDir = path.join(process.cwd(), 'uploads', 'audio');
    fs.mkdirSync(this.memesDir, { recursive: true });
    fs.mkdirSync(this.audioDir, { recursive: true });
  }

  /**
   * Download a Discord attachment and save it as uploads/memes/<sanitizedName>.<ext>.
   *
   * The filename is derived from displayName rather than the original upload filename.
   * This prevents name collisions and path traversal while keeping filenames human-readable.
   */
  async saveMeme(
    displayName: string,
    fileUrl: string,
    extension: string,
  ): Promise<{ filename: string; filePath: string }> {
    const filename = `${sanitizeFilename(displayName)}.${extension}`;
    const filePath = path.join(this.memesDir, filename);
    await this.download(fileUrl, filePath);
    return { filename, filePath };
  }

  /**
   * Download a Discord attachment and save it as uploads/audio/<sanitizedName>.<ext>.
   * Stored audio is played back from disk; it is NOT streamed in real time.
   */
  async saveSound(
    displayName: string,
    fileUrl: string,
    extension: string,
  ): Promise<{ filename: string; filePath: string }> {
    const filename = `${sanitizeFilename(displayName)}.${extension}`;
    const filePath = path.join(this.audioDir, filename);
    await this.download(fileUrl, filePath);
    return { filename, filePath };
  }

  private download(url: string, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(destPath);

      const cleanup = (err: Error) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      };

      const options = url.startsWith('https') ? { agent: httpsAgent } : {};
      protocol
        .get(url, options, (response) => {
          if (response.statusCode && response.statusCode >= 400) {
            cleanup(new Error(`HTTP ${response.statusCode} downloading file`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => file.close(() => resolve()));
          file.on('error', cleanup);
        })
        .on('error', cleanup);
    });
  }

  deleteMeme(filePath: string): void {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  deleteSound(filePath: string): void {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export const storageService = new StorageService();
