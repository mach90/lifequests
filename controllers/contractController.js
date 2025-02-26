/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Contract = require("./../models/contractModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
CONTRACTS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL CONTRACTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllContracts = factory.getAll(Contract);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET CONTRACT BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getContract = factory.getOne(Contract);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE CONTRACT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createContract = factory.createOne(Contract);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH CONTRACT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchContract = factory.patchOne(Contract);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE CONTRACT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteContract = factory.deleteOne(Contract);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY CONTRACTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMyContracts = catchAsync(async (req, res, next) => {
    const baseQuery = Contract.find({ user: req.user.id });
    
    const featuresForCount = new APIFeatures(Contract.find({ user: req.user.id }), req.query).filter();
    const totalCount = await Contract.countDocuments(featuresForCount.query._conditions);

    const features = new APIFeatures(baseQuery, req.query).filter().sort().limitFields().paginate();
    const contracts = await features.query;
    
    res.status(200).json({
        status: "success",
        results: contracts.length,
        totalCount,
        data: {
            data: contracts,
        },
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY CONTRACT BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMyContract = catchAsync(async (req, res, next) => {
    const contract = await Contract.findOne({ 
        _id: req.params.contractId,
        user: req.user.id 
    });

    if (!contract) {
        return next(new AppError("No contract found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: contract
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE MY CONTRACT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createMyContract = catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;

    const newContract = await Contract.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            data: newContract
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH MY CONTRACT
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchMyContract = catchAsync(async (req, res, next) => {
    const contract = await Contract.findOneAndUpdate(
        { 
            _id: req.params.contractId,
            user: req.user.id 
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!contract) {
        return next(new AppError("No contract found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: contract
        }
    });
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET MY CONTRACTS FINISHED AFTER DATE YYYY-MM-DD
For statistics
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getMyContractsAfterDate = catchAsync(async (req, res, next) => {
    const { date } = req.params;
    
    if (!date) {
        return next(new AppError("Please provide a date", 400));
    }
    
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const baseQuery = Contract.find({ 
        user: req.user.id,
        finishedAt: { 
            $gte: new Date(date), 
            $lte: new Date()
        }
    });
    
    const features = new APIFeatures(baseQuery, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
        
    const contracts = await features.query;
    
    const totalCount = await Contract.countDocuments({
        user: req.user.id,
        finishedAt: { 
            $gte: new Date(date), 
            $lte: new Date()
        }
    });

    const perDayStats = await Contract.aggregate([
        {
            $match: { 
                user: userId,
                finishedAt: { 
                    $gte: new Date(date), 
                    $lte: new Date()
                }
            }
        },
        {
            $lookup: {
                from: "quests",
                localField: "quest",
                foreignField: "_id",
                as: "quest"
            }
        },
        {
            $unwind: "$quest"
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$finishedAt" } },
                numContractsForThatDate: { $sum: 1 },
                totalExperience: { $sum: "$quest.reward.experience" },
                totalMoney: { $sum: "$quest.reward.money" }
            }
        },
        {
            $sort: { _id: 1 }
        },
    ]);

    const averageStats = await Contract.aggregate([
        {
            $match: { 
                user: userId,
                finishedAt: { 
                    $gte: new Date(date), 
                    $lte: new Date()
                }
            }
        },
        {
            $lookup: {
                from: "quests",
                localField: "quest",
                foreignField: "_id",
                as: "quest"
            }
        },
        {
            $unwind: "$quest"
        },
        {
            $group: {
                _id: null,
                avgExperience: { $avg: "$quest.reward.experience" },
                avgMoney: { $avg: "$quest.reward.money" }
            }
        },
    ]);
    
    res.status(200).json({
        status: "success",
        results: contracts.length,
        totalCount,
        data: {
            data: contracts,
            perDayStats,
            averageStats
        },
    });
});