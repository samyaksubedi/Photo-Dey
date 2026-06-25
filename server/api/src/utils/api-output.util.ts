class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  constructor(statusCode: number, data: T, message: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}


class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: unknown[];

  constructor(
    statusCode: number,
    message: string,
    errors: unknown[] = [],
    stack?: string,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      success: this.success,
    };
  }
}
export { ApiResponse, ApiError };
