import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { FileStorage, FileToStore, StoredFile } from './file-storage';

const extensions: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

@Injectable()
export class LocalFileStorage implements FileStorage {
  private readonly uploadsDirectory = join(process.cwd(), 'uploads');
  async save(file: FileToStore): Promise<StoredFile> {
    await mkdir(this.uploadsDirectory, { recursive: true });
    const storageKey = `${randomUUID()}${extensions[file.mimeType] ?? ''}`;
    await writeFile(join(this.uploadsDirectory, storageKey), file.buffer);
    return {
      storageKey,
      originalFileName: file.originalFileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    };
  }
  async delete(storageKey: string): Promise<void> {
    await rm(join(this.uploadsDirectory, storageKey), { force: true });
  }
}
