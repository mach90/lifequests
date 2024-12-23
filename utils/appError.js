/* //////////////////////////////////////////////////
APP ERROR CLASS
////////////////////////////////////////////////// */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isAnOperationalError = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;