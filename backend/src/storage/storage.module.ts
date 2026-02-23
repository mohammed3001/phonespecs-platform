// src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AdminStorageController } from './admin-storage.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AdminStorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

// ──────────────────────────────────────────────────────────────
// src/storage/admin-storage.controller.ts
import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFiles, UploadedFile,
  HttpCode, HttpStatus, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StorageService } from './storage.service';

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
export class AdminStorageController {
  constructor(private storage: StorageService) {}

  /** GET /admin/media — Media library */
  @Get()
  getLibrary(
    @Query('bucket') bucket?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.storage.getMediaLibrary(bucket, parseInt(page), parseInt(limit));
  }

  /**
   * POST /admin/media/images
   * Upload 1-10 images at once
   * Accepted: jpg, jpeg, png, webp, gif
   * Max per file: 10MB
   * Auto-converts to WebP, generates thumbnail, reads dimensions
   */
  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.mimetype)) {
        cb(new BadRequestException(`Invalid image type: ${file.mimetype}. Allowed: jpg, png, webp, gif`), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder = 'general',
    @Body('bucket') bucket = 'phone-images',
  ) {
    if (!files?.length) throw new BadRequestException('No files provided');
    const results = await Promise.all(
      files.map((file) => this.storage.uploadImage(file, bucket, folder)),
    );
    return { uploaded: results.length, files: results };
  }

  /**
   * POST /admin/media/videos
   * Upload 1 video at a time
   * Accepted: mp4, webm, mov
   * Max: 200MB
   * Auto-reads dimensions and duration
   */
  @Post('videos')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 200 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
      const ext = file.originalname.toLowerCase();
      const validExt = ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.mov');
      if (!allowed.includes(file.mimetype) && !validExt) {
        cb(new BadRequestException('Invalid video format. Allowed: mp4, webm, mov'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder = 'videos',
    @Body('bucket') bucket = 'phone-videos',
  ) {
    if (!file) throw new BadRequestException('No video file provided');
    return this.storage.uploadVideo(file, bucket, folder);
  }

  /** DELETE /admin/media/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.storage.deleteById(id);
  }
}
