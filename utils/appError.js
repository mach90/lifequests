/* //////////////////////////////////////////////////
APP ERROR CLASS
////////////////////////////////////////////////// */
class AppError extends Error {
    // Constructor for the AppError class
    constructor(message, statusCode) {
        // Call the parent class (Error) constructor with the message
        super(message);

        // Set the status code
        this.statusCode = statusCode;

        // Determine the status based on the status code
        // If the status code starts with "4", set status to "fail", otherwise set it to "error"
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

        // Mark this as an operational error
        this.isAnOperationalError = true;

        // Capture the stack trace for this error
        Error.captureStackTrace(this, this.constructor);
    }

}

module.exports = AppError;