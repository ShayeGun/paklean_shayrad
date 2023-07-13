abstract class CustomError extends Error {
    abstract statusCode: number

    constructor(msg: string) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export { CustomError };