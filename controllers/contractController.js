/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const Contract = require("./../models/contractModel");
const Quest = require("./../models/questModel");
const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");
// const AppError = require("./../utils/appError");
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
    const features = new APIFeatures(baseQuery, req.query).filter().sort().limitFields().paginate();
    const contracts = await features.query;
    
    res.status(200).json({
        status: "success",
        results: contracts.length,
        data: {
            data: contracts,
        },
    });
});