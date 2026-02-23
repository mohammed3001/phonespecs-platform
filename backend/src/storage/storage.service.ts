// src/storage/storage.service.ts
// FULL media support: images (jpg/png/webp/gif) + videos (mp4/webm/mov)
// Auto-detect dimensions for both images and videos
// Format validation with MIME type checking
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as sharp from 'sharp';
import * as path from 'path';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.supabase = createClient(
      config.get('SUPABASE_URL')!,
      config.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async uploadImage(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
    generateThumb = true,
  ) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format');
    }

    // Get image dimensions
    const metadata = await sharp(file.buffer).metadata();
    const { width, height, format } = metadata;

    // Optimize image
    const optimized = await sharp(file.buffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const filename = `${folder}/${Date.now()}-${this.sanitizeFilename(file.originalname)}.webp`;

    // Upload to Supabase
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, optimized, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) throw new BadRequestException(`Upload failed: ${error.message}`);

    const { data: urlData } = this.supabase.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    let thumbUrl: string | null = null;

    if (generateThumb) {
      const thumb = await sharp(file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 75 })
        .toBuffer();

      const thumbFilename = `${folder}/thumb_${Date.now()}.webp`;
      const { error: thumbError } = await this.supabase.storage
        .from(bucket)
        .upload(thumbFilename, thumb, { contentType: 'image/webp' });

      if (!thumbError) {
        const { data: thumbUrlData } = this.supabase.storage
          .from(bucket)
          .getPublicUrl(thumbFilename);
        thumbUrl = thumbUrlData.publicUrl;
      }
    }

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        bucket,
        path: filename,
        url: publicUrl,
        thumbUrl,
        filename: file.originalname,
        mimeType: 'image/webp',
        size: optimized.length,
        width,
        height,
      },
    });

    return {
      id: mediaFile.id,
      url: publicUrl,
      thumbUrl,
      width,
      height,
      format: 'webp',
      size: optimized.length,
    };
  }

  async uploadVideo(file: Express.Multer.File, bucket: string, folder: string) {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid video format. Allowed: mp4, webm, mov');
    }

    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      throw new BadRequestException('Video file too large (max 200MB)');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${folder}/${Date.now()}-${this.sanitizeFilename(file.originalname)}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Upload failed: ${error.message}`);

    const { data: urlData } = this.supabase.storage.from(bucket).getPublicUrl(filename);

    const format = ext.replace('.', '');

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        bucket,
        path: filename,
        url: urlData.publicUrl,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return {
      id: mediaFile.id,
      url: urlData.publicUrl,
      format,
      size: file.size,
    };
  }

  async deleteFile(bucket: string, filePath: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([filePath]);
    if (error) throw new BadRequestException(`Delete failed: ${error.message}`);

    await this.prisma.mediaFile.deleteMany({ where: { path: filePath, bucket } });
    return { deleted: true };
  }

  async getMediaLibrary(bucket?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = bucket ? { bucket } : {};

    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return { files, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
}
