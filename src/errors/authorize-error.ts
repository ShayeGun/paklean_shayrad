import { CustomError } from "./custom-error";

class AuthError extends CustomError {
    statusCode = 401;

    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        // Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export { AuthError }