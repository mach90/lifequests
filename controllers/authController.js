/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const crypto = require("crypto");
const {promisify} = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
FUNCTIONS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const signToken = id => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN //users will be logged-out because token will become invalid in 90days
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // domain: process.env.NODE_ENV === 'production' 
        //   ? 'lifequests.netlify.app' 
        //   : 'localhost'
    };

    // const cookieOptions = {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //     domain: process.env.NODE_ENV === 'production' ? 'lifequests.onrender.com' : 'localhost'
    // };
    
    // if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);

    user.password = undefined; //remove the password from output

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
}

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
AUTHENTICATION AND PROTECTION ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
SIGNUP NEW USER
Create the user
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const url = `${req.protocol}://${req.get("host")}/account`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
LOGIN USER
Check email, password etc.
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    /* Check if email and password exist */
    if(!email || !password) {
       return next(new AppError("Please provide email and password", 400));
    }
    /* Check if user exists and password is correct */
    const user = await User.findOne({email: email}).select("+password");

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    /* If everything ok, send token back to client */
    createSendToken(user, 200, res);
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
LOGOUT ROUTE
We can't modify or delete the jwt so we will send a dummy jwt that will log out the user
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.status(200).json({status: "success"});
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PROTECT ROUTES
Only logged in user with valid jwt token can access a certain route
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    /* Get the token and check if it exists */
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError("You are not logged in, please log in to get access.", 401));
    }

    /* Verify the token signature is valid */
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded)

    /* Check if user still exists */
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("The user belonging to this token doesn't exist anymore.", 401));
    }
    
    /* Check if user changed password after the JWT was issued */
    if(currentUser.changedPasswordAfter(decoded.iat)) { //iat = token issued at
        return next(new AppError("User recently changed password, please log in again.", 401));
    }

    /* Grant access to the protected route if it passed all the above steps */
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
IS LOGGED IN
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            /* Verify the token signature is valid */
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt, 
                process.env.JWT_SECRET
            );
            
            /* Check if user still exists */
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }
            
            /* Check if user changed password after the JWT was issued */
            if(currentUser.changedPasswordAfter(decoded.iat)) { //iat = token issued at
                return next();
            }
            
            /* There is a logged in user */
            res.locals.user = currentUser;
            return next();
        } catch(err) {
            return next();
        }
    }
    next();
};

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
RESTRICT ROUTE
Only certain roles can interact with certain ressources
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        /* roles is an array */
        if(!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403));
        }

        next();
    }
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
FORGOT/RESET PASSWORD
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.forgotPassword = catchAsync(async (req, res, next) => { 
    /* //////////////////////////////////////////////////
    Get user based on POSTed email
    ////////////////////////////////////////////////// */
    const user = await User.findOne({email: req.body.email});

    /* //////////////////////////////////////////////////
    Generate random reset token 
    ////////////////////////////////////////////////// */
    // 🟠 TODO: ONLY IF EMAIL RESET TOKEN IS EXPIRED OR NOT EXIST
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    /* //////////////////////////////////////////////////
    Send generated reset token to the email with Nodemailer 
    ////////////////////////////////////////////////// */
    
    /* const message = `Forgot your password ? Submit a PATCH request with your new password 
    and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;*/
    
    try {
        // const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        // const resetURL = `http://localhost:5173/reset/${resetToken}`;
        const resetURL = `http://lifequests.netlify.app/reset/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();
    
        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        });
    } catch(err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError("There was an error sending the email. Try again later", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => { 
    /* //////////////////////////////////////////////////
    Get user based on the token from the URL (from mail)
    ////////////////////////////////////////////////// */
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken, 
        passwordResetExpires: {$gt: Date.now()}
    });

    /* //////////////////////////////////////////////////
    If token not expired and user exists, set the new password
    ////////////////////////////////////////////////// */
    if(!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();   

    /* //////////////////////////////////////////////////
    Send jwt token to user and log the user in
    ////////////////////////////////////////////////// */
    createSendToken(user, 200, res);
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
UPDATING PASSWORD (logged in users)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updatePassword = catchAsync(async (req, res, next) => {
    /* //////////////////////////////////////////////////
    Get user from the collection
    You are supposed to be logged in so req.user.id
    ////////////////////////////////////////////////// */
    const user = await User.findById(req.user.id).select("+password");

    /* //////////////////////////////////////////////////
    Check if the POSTed passwordCurrent is corresponding
    to the user password (the one you want to change)
    ////////////////////////////////////////////////// */
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError("The current password is incorrect", 401));
    }

    /* //////////////////////////////////////////////////
    If so, update the user password and passwordConfirm
    (the new one you want)
    ////////////////////////////////////////////////// */
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    /* //////////////////////////////////////////////////
    Send jwt token to user and log the user in
    ////////////////////////////////////////////////// */
    createSendToken(user, 200, res);
});