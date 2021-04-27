import { ValidationError } from 'express-validator';
import { CustomError} from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: Array<ValidationError>) {
    super("invalid request parameters");
    // below required because we are extending built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

    serializeErrors() {
      return this.errors.map(error => ({
        message: error.msg,
        field: error.param,
      }));
    }
}
