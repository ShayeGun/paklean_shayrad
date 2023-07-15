class CustomError extends Error {
    private statusCode: number;
    private errorCode: number;

    constructor(msg: string, status: number, errCode: number) {
        super(msg);
        this.statusCode = status;
        this.errorCode = errCode;

        Error.captureStackTrace(this, this.constructor);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    errStatus() {
        return this.statusCode
    }

    errInfo() {
        return {
            code: this.errorCode,
            errMsg: this.message
        }
    }
}

export { CustomError };