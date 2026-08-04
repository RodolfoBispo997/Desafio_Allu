export enum ApplicationErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  UNPROCESSABLE = 'UNPROCESSABLE',
}

export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: ApplicationErrorCode,
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}
