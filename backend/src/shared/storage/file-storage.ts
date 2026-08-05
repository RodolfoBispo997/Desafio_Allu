export interface FileToStore {
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer;
}

export interface StoredFile {
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
}

export interface FileStorage {
  save(file: FileToStore): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}
