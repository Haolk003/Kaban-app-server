import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}
@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }
  async uploadFile(
    file: UploadFile,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${folder}`,
          resource_type: 'auto',
          allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'doc', 'docx'],
          transformation: { quality: 'auto:best' },
        },
        (error, result) => {
          if (error) {
            console.log(error);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            return reject(error);
          }
          console.log(result);
          return resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  optimizeImage(url: string, width?: number): Promise<string> {
    const publicId = url.split('/').pop()?.split('.')[0] || '';
    return Promise.resolve(
      cloudinary.url(publicId, {
        width,
        quality: 'auto:best',
        fetch_format: 'auto',
      }),
    );
  }
}
