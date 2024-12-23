/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const AppError = require("./../utils/appError");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
FUNCTIONS TO HANDLE SPECIFIC ERRORS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
HANDLING MONGOOSE INVALID DB ID (CastError)
When searching for a tour by writing an ID that has an invalid format
It's not the same as searching a tour by writing a valid ID format but that has no match
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
HANDLE DUPLICATE DATABASE FIELD
When trying to create a document but a document with a same name field already exists in the database
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const handleDuplicateFieldsErrorDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`;
    return new AppError(message, 400);
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
HANDLING MONGOOSE VALIDATION ERRORS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.properties.message);
    const message = `Invalid input: ${errors.join(". ")}.`;
    return new AppError(message, 400);
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
HANDLING JWT TOKEN ERROR
Basically the token is not correct
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const handleJWTError = () => new AppError("Invalid token. Please log in again.", 401);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
HANDLING EXPIRED JWT TOKEN ERROR
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const handleJWTExpiredError = () => new AppError("Expired token. Please log in again.", 401);

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
FUNCTIONS, SEND ERRORS DEPENDING ON THE ENVIRONEMENT (DEV vs PROD)
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
SEND ERROR FORMAT IN DEVELOPMENT ENVIRONEMENT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const sendErrorDev = (err, req, res) => {
    //API
    if(req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } 

    
    //RENDERED WEBSITE
    console.error("❌ERROR❌", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message
    });
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
SEND ERROR FORMAT IN PRODUCTION ENVIRONEMENT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const sendErrorProd = (err, req, res) => {
    //API
    if(req.originalUrl.startsWith("/api")) { 
        //Operational, trusted error: send message to client
        if(err.isAnOperationalError) { 
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } //programming, unknown error: don't leak error details
        console.error("❌ERROR❌", err);

        return res.status(500).json({
            status: "error",
            message: "🤷‍♂️ Something went wrong..."
        });
    }

    //RENDERED WEBSITE
    if(err.isAnOperationalError) { 
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong",
            msg: err.message
        });
    }

    console.error("❌ERROR❌", err);

    return res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: "Please try again later"
    });

}

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
ERROR CONTROLLER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500; //will give a default 500 internal error status code if no status code is already defined
    err.status = err.status || "error"; //will give a default "error" status if no status is already defined

    if(process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = {...err};
        error.message = err.message;
        if(err.name === "CastError") error = handleCastErrorDB(error);
        if(err.code === 11000) error = handleDuplicateFieldsErrorDB(error);
        if(err.name === "ValidationError") error = handleValidationErrorDB(error);
        if(err.name === "JsonWebTokenError") error = handleJWTError();
        if(err.name === "TokenExpiredError") error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
}