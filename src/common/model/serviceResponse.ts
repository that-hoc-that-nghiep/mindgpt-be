export class ServiceResponse<T = null> {
  readonly status: number;
  readonly message: string;
  readonly data: T;

  private constructor(message: string, data: T, status: number) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data: T, status: number = 200) { 
    return new ServiceResponse(message, data, status);
  }

  static failure<T>(message: string, data: T, statusCode: number = 400) {
    return new ServiceResponse(message, data, statusCode);
  }
}

