import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { TaskService } from './task.service';
import {FilesInterceptor} from '@nestjs/platform-express';
import { CloudinaryService } from 'y/cloudinary';

import { Express } from 'express';
import 'multer';

@Controller('/api/tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly storageService: CloudinaryService,
  ) {}

  @Get()
  getHello(): string {
    return this.taskService.getHello();
  }

  @Post('/attachments')
  @UseInterceptors(FilesInterceptor('files',10))
  async uploadTaskAttachment(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), // 10MB
          new FileTypeValidator({
            fileType:
              /^(image\/(jpeg|png|gif|jpg)|application\/(pdf|txt|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|rtf|xml|json|csv|plain))$/,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const attachmentsData = await Promise.all(
      files.map(async (file) => {
        const response = await this.storageService.uploadTaskAttachment(
          file,
          `task-attachments`,
        );

        return {
          fileName: response.original_filename as string,
          file_public_id: response.public_id as string,
          filePath: response.url as string,
          fileType: file?.mimetype || 'unknown file type',
          fileSize: file?.size || 0,
        };
      }),
    );

    return attachmentsData;
  }
}
