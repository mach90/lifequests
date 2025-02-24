/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Skillset = require("./../models/skillsetModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ 
*/

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
SKILLSETS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL SKILLSETS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllSkillsets = factory.getAll(Skillset);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET SKILLSET BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getSkillset = factory.getOne(Skillset);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createSkillset = factory.createOne(Skillset);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchSkillset = factory.patchOne(Skillset);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteSkillset = factory.deleteOne(Skillset);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE MY SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createMySkillset = catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;

    const newSkillset = await Skillset.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            data: newSkillset
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMySkillset = catchAsync(async (req, res, next) => {
    const skillset = await Skillset.findOne({ user: req.user.id });

    if (!skillset) {
        return next(new AppError('No skillset found for this user', 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: skillset
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH MY SKILLSET
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchMySkillset = catchAsync(async (req, res, next) => {
    // Check if the request body contains skills
    if (!req.body.skills || !Array.isArray(req.body.skills)) {
        return next(new AppError('Please provide an array of skill IDs', 400));
    }

    // // Validate that all provided IDs are valid ObjectIds
    // const invalidIds = req.body.skills.some(id => !mongoose.Types.ObjectId.isValid(id));
    // if (invalidIds) {
    //     return next(new AppError('Invalid skill ID format', 400));
    // }

    // Use $addToSet to add skills to the array (prevents duplicates)
    const skillset = await Skillset.findOneAndUpdate(
        { user: req.user.id },
        { 
            $addToSet: { 
                skills: { 
                    $each: req.body.skills 
                } 
            } 
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!skillset) {
        return next(new AppError('No skillset found for this user.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: skillset
        }
    });
});