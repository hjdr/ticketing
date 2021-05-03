import { CustomError } from './custom-error';

export class NotAuthorisedError extends CustomError {
  statusCode = 401;

  constructor() {
    super('Not authorised');
    // below required because we are extending built in class
    Object.setPrototypeOf(this, NotAuthorisedError.prototype);
  }


  serializeErrors()  {
    return [{ message: 'Not authorised' }];
  }
}
