import { Module } from '@nestjs/common';
import { AuthLibraryService } from './auth-library.service';

@Module({
  providers: [AuthLibraryService],
  exports: [AuthLibraryService],
})
export class AuthLibraryModule {}
