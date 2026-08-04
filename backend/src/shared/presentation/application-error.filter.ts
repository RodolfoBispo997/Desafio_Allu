import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import {
  ApplicationError,
  ApplicationErrorCode,
} from '../application/application-error';

@Catch(ApplicationError)
export class ApplicationErrorFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = {
      [ApplicationErrorCode.NOT_FOUND]: 404,
      [ApplicationErrorCode.CONFLICT]: 409,
      [ApplicationErrorCode.GONE]: 410,
      [ApplicationErrorCode.UNPROCESSABLE]: 422,
    }[exception.code];
    response.status(statusCode).json({
      statusCode,
      message: exception.message,
    });
  }
}
