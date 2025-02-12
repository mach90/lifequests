/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Progress = require("./../models/progressModel");
const Guild = require("./../models/guildModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
// const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
PROGRESS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllProgress = factory.getAll(Progress);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET PROGRESS BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getProgress = factory.getOne(Progress);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createProgress = factory.createOne(Progress);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchProgress = factory.patchOne(Progress);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteProgress = factory.deleteOne(Progress);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL MY PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllMyProgress = catchAsync(async (req, res, next) => {
    const baseQuery = Progress.find({ user: req.user.id });

    const featuresForCount = new APIFeatures(Progress.find({ user: req.user.id }), req.query).filter();
    const totalCount = await Progress.countDocuments(featuresForCount.query._conditions);

    const features = new APIFeatures(baseQuery, req.query).filter().sort().limitFields().paginate();
    const progress = await features.query;
    
    res.status(200).json({
        status: "success",
        results: progress.length,
        totalCount,
        data: {
            data: progress,
        },
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY PROGRESS BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMyProgress = catchAsync(async (req, res, next) => {
    const progress = await Progress.findOne({
        _id: req.params.progressId,
        user: req.user.id
    });

    if(!progress) {
        return next(new AppError("No progress found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: progress
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE MY PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createMyProgress = catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;

    const newProgress = await Progress.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            data: newProgress
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH MY PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updateMyProgress = catchAsync(async (req, res, next) => {
    const updateObj = { $inc: {} };

    if (req.body.experience) {
        updateObj.$inc.experience = req.body.experience;
    }
    
    const updatedProgress = await Progress.findOneAndUpdate(
        { _id: req.params.progressId }, // Utilisez l'ID de l'URL
        updateObj,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedProgress) {
        return next(new AppError("No progress found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: updatedProgress
        }
    });
});