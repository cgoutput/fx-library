import { Global, Module } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class StorageModule {}
