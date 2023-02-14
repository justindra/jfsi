export class AuthenticationException extends Error {
  constructor(
    message = 'The user is not yet authenticated.',
    public statusCode = 401
  ) {
    super(message);
    this.name = 'AuthenticationException';

    // Set the prototype explicitly.
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AuthenticationException.prototype);
  }
}

export class AuthorizationException extends Error {
  constructor(
    message = 'The user is not allowed to perform this action.',
    public statusCode = 403
  ) {
    super(message);
    this.name = 'AuthorizationException';

    // Set the prototype explicitly.
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AuthorizationException.prototype);
  }
}

export class ValidationException extends Error {
  /**
   * @param message The error message
   * @param statusCode The HTTP Status Code
   * @param code Any additional Code for frontend to use
   * @param data Any additional data for frontend to use
   */
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ValidationException';

    // Set the prototype explicitly.
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

export class NotFoundException extends Error {
  /**
   * @param message The error message
   * @param statusCode The HTTP Status Code
   * @param code Any additional Code for frontend to use
   * @param data Any additional data for frontend to use
   */
  constructor(
    message: string = 'The requested resource was not found.',
    public statusCode = 404,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'NotFoundException';

    // Set the prototype explicitly.
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}
