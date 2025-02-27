/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const multer = require("multer"); //npm i multer, multipart form handling middleware, upload photo etc.
const sharp = require("sharp"); //npm i sharp, image processing library, resize photo etc.
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
UPLOAD PHOTO
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new AppError("Only images are allowed to be upload.", 400), false);
    }
}

const multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = multerUpload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();
    
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
FUNCTIONS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
USERS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL USERS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllUsers = factory.getAll(User);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET USER BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getUser = factory.getOne(User);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
ENDPOINT /ME
To retrieve all the data belonging to me
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
UPDATE ME (LOGGED IN USER)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updateMe = catchAsync(async(req, res, next) => {
    /* //////////////////////////////////////////////////
    Create error if user POSTs data that contain password
    related data
    ////////////////////////////////////////////////// */
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for updating your password, please use /updateMyPassword for that", 400));
    }
    
    /* //////////////////////////////////////////////////
    Update user document
    ////////////////////////////////////////////////// */
    const filteredBody = filterObj(req.body, "name", "email"); //we only allow name and email to be changed

    if(req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
UPDATE MY (APP) SETTINGS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updateMySettings = catchAsync(async(req, res, next) => {
    const filteredBody = filterObj(req.body, "settings"); //we only allow settings to be changed

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
UPDATE MY CHARACTER (attributes, money, (skills?))
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updateMyCharacter = catchAsync(async(req, res, next) => {
    if(req.body.password || req.body.passwordConfirm || req.body.name || req.body.email ) {
        return next(new AppError("This route is not for updating user or password, please use /updateMe or /updateMyPassword for that", 400));
    }

    // const filteredBody = filterObj(req.body, "money", "experience", "attributes");

    // const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});

    // Create the update object with $inc operator
    const updateObj = { $inc: {} };
    
    // Handle direct number fields (money, experience)
    if (req.body.money) {
        updateObj.$inc.money = req.body.money;
    }
    if (req.body.experience) {
        updateObj.$inc.experience = req.body.experience;
    }

    // Handle nested attributes
    if (req.body.attributes) {
        for (const [key, value] of Object.entries(req.body.attributes)) {
            updateObj.$inc[`attributes.${key}`] = value;
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id, 
        updateObj, 
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE ME (LOGGED IN USER)
Will only set to inactive
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false});

    res.status(204).json({
        status: "success",
        data: null
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE USER (need id)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteUser = factory.deleteOne(User);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH USER (need id)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchUser = factory.patchOne(User);

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
UPLOAD PHOTO
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const upload = multer({dest: "public/img/users"});