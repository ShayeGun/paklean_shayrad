import { CustomError } from "./custom-error";

class RouteError extends CustomError {
    statusCode = 404;

    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        // Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export { RouteError }