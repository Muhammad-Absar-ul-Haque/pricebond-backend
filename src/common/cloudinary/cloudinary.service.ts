import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadPdf(filePath: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'prizebond_results',
        resource_type: 'raw', // PDF must be raw for best compatibility
        type: 'upload',      // Explicitly set as a public upload
        access_mode: 'public',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw new Error('Failed to upload PDF to Cloudinary');
    }
  }
}
