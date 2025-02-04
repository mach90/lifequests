/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Contract = require("./../models/contractModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

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
        return next(new AppError('No contract found with that ID', 404));
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
        return next(new AppError('No contract found with that ID', 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: contract
        }
    });
});