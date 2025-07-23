import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import path from 'path';
import fs from 'fs';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClient: ContainerClient | null = null;

  constructor() {
    if (config.storage.provider === 'azure' && config.storage.azure.connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        config.storage.azure.connectionString
      );
      this.containerClient = this.blobServiceClient.getContainerClient(
        config.storage.azure.containerName
      );
    }
  }

  /**
   * Upload file to Azure Blob Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    try {
      if (config.storage.provider === 'local') {
        return this.uploadToLocal(file, folder);
      } else if (config.storage.provider === 'azure') {
        return this.uploadToAzure(file, folder);
      } else {
        throw new Error(`Unsupported storage provider: ${config.storage.provider}`);
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      if (config.storage.provider === 'local') {
        await this.deleteFromLocal(filename);
      } else if (config.storage.provider === 'azure') {
        await this.deleteFromAzure(filename);
      }
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw new Error('File deletion failed');
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    if (config.storage.provider === 'local') {
      return `${config.api.url}/uploads/${filename}`;
    } else if (config.storage.provider === 'azure') {
      return this.getAzureSignedUrl(filename, expiresIn);
    }
    
    throw new Error(`Unsupported storage provider: ${config.storage.provider}`);
  }

  /**
   * Upload to local filesystem
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadResult> {
    const filename = this.generateFilename(file.originalname);
    const uploadPath = path.join(config.storage.path, folder);
    const filePath = path.join(uploadPath, filename);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `${config.api.url}/uploads/${folder}/${filename}`,
      filename: `${folder}/${filename}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Upload to Azure Blob Storage
   */
  private async uploadToAzure(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadResult> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const filename = this.generateFilename(file.originalname);
    const blobName = `${folder}/${filename}`;
    
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    // Upload file with metadata
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
        blobContentDisposition: `inline; filename="${file.originalname}"`,
      },
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate URL
    let url = blockBlobClient.url;
    
    // Use CDN endpoint if configured
    if (config.storage.azure.cdnEndpoint) {
      url = url.replace(
        `https://${config.storage.azure.accountName}.blob.core.windows.net`,
        config.storage.azure.cdnEndpoint
      );
    }

    return {
      url,
      filename: blobName,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Delete from local filesystem
   */
  private async deleteFromLocal(filename: string): Promise<void> {
    const filePath = path.join(config.storage.path, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Local file deleted: ${filename}`);
    }
  }

  /**
   * Delete from Azure Blob Storage
   */
  private async deleteFromAzure(filename: string): Promise<void> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    await blockBlobClient.deleteIfExists();
    
    logger.info(`Azure blob deleted: ${filename}`);
  }

  /**
   * Get Azure Blob Storage signed URL
   */
  private async getAzureSignedUrl(filename: string, expiresIn: number): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Azure Blob Storage not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    
    // For Azure, we can use SAS tokens for signed URLs
    // This requires additional configuration for SAS token generation
    // For now, return the direct URL (assuming public access or CDN)
    let url = blockBlobClient.url;
    
    if (config.storage.azure.cdnEndpoint) {
      url = url.replace(
        `https://${config.storage.azure.accountName}.blob.core.windows.net`,
        config.storage.azure.cdnEndpoint
      );
    }

    return url;
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitize filename
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${timestamp}_${random}_${sanitizedBaseName}${extension}`;
  }

  /**
   * Validate file type
   */
  static validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  /**
   * Get file type category
   */
  static getFileTypeCategory(mimeType: string): 'audio' | 'video' | 'image' | 'document' {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  }

  /**
   * Generate thumbnail for video/image files
   */
  async generateThumbnail(file: Express.Multer.File): Promise<Buffer | null> {
    // This would implement thumbnail generation using sharp for images
    // and ffmpeg for videos. For now, return null.
    return null;
  }
}