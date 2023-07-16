class CustomError extends Error {
    private statusCode: number;
    private errorCode: number;
    private status: string;

    constructor(msg: string, status: number, errCode: number) {
        super(msg);
        this.statusCode = status;
        this.errorCode = errCode;
        this.status = `${status}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    errStatus() {
        return this.statusCode
    }

    errInfo() {
        return {
            status: this.status,
            code: this.errorCode,
            errMsg: this.message
        }
    }
}

export { CustomError };