/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Progress = require("./../models/progressModel");
const Guild = require("./../models/guildModel");
const Quest = require("./../models/questModel");
const Contract = require("./../models/contractModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
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

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH MANY OF MY PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.updateOrCreateContractRelatedProgress = catchAsync(async (req, res, next) => {
    const { contractId } = req.params;
    const { experience } = req.body;
    const userId = req.user.id;

    // First find the contract without population to get the quest ID
    const contract = await Contract.findById(contractId);

    if (!contract) {
        return next(new AppError("No contract found with that ID", 404));
    }

    // Then find the quest directly with its guilds
    const quest = await Quest.findById(contract.quest).select('guilds');

    if (!quest) {
        return next(new AppError("Contract is not associated with a quest", 400));
    }

    if (!quest.guilds || quest.guilds.length === 0) {
        return next(new AppError("The quest does not belong to any guild", 400));
    }

    // Array to store the updated or created progress entries
    const progressEntries = [];

    // Loop through each guild ID and update/create progress
    for (const guildId of quest.guilds) {
        // Check if a progress entry already exists for the user and guild
        let progress = await Progress.findOne({ 
            user: userId, 
            guild: guildId
        });

        if (progress) {
            // If progress exists, use findOneAndUpdate with $inc for atomic operation
            progress = await Progress.findOneAndUpdate(
                { _id: progress._id },
                { $inc: { experience: experience } },
                { new: true, runValidators: true }
            );
        } else {
            // If progress does not exist, create a new progress entry
            progress = await Progress.create({
                user: userId,
                guild: guildId,
                experience: experience
            });
        }

        progressEntries.push(progress);
    }

    // Populate the guild information in the response
    const populatedProgress = await Progress.populate(progressEntries, {
        path: 'guild',
        select: 'name'
    });

    res.status(200).json({
        status: "success",
        data: {
            data: populatedProgress
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY GUILD'S PROGRESS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getGuildProgress = catchAsync(async (req, res, next) => {
    const guild = await Guild.findById(req.params.guildId);

    if (!guild) {
        return next(new AppError("No guild found with that ID", 404));
    }

    const query = Progress.findOne({ 
        guild: guild._id,
        user: req.user.id
    });

    const progress = await query;

    res.status(200).json({
        status: "success",
        data: {
            progress
        }
    });
});