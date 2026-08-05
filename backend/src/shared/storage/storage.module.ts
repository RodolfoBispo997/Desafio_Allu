import { Module } from '@nestjs/common';
import { LocalFileStorage } from './local-file-storage';

@Module({
  providers: [{ provide: 'FileStorage', useClass: LocalFileStorage }],
  exports: ['FileStorage'],
})
export class StorageModule {}
