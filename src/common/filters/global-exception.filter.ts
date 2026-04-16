import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any)?.message || 'Internal server error';

    // 🪵 LOGGING THE FAILURE
    // For 500 errors or unknown exceptions, log the full stack trace.
    // For expected HttpExceptions (400, 401, 403, etc.), log the summary.
    const logInfo = `[${request.method}] ${request.url} - Status: ${status} - Error: ${
      typeof message === 'object' ? JSON.stringify(message) : message
    }`;

    if (status >= 500) {
      this.logger.error(logInfo, exception instanceof Error ? exception.stack : '');
    } else {
      this.logger.warn(logInfo);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? (message as any).message : message,
    });
  }
}
