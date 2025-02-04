/* //////////////////////////////////////////////////
REQUIRE
////////////////////////////////////////////////// */
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");

/* //////////////////////////////////////////////////
GET ALL, HANDLER FACTORY
////////////////////////////////////////////////// */
exports.getAll = Model => catchAsync(async (req, res, next) => {
    /* To allow for nested GET reviews on quest (hack) 🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧*/
    let filter = {};
    if(req.params.questId) filter = {quest: req.params.questId};

    const totalCount = await Model.countDocuments(filter);

    /* EXECUTING THE QUERY */
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    const docs = await features.query;

    /* SEND RESPONSE */
    res.status(200).json({
        status: "success",
        results: docs.length,
        totalCount,
        data: {
            data: docs,
        },
    });
});

/* //////////////////////////////////////////////////
GET ONE, HANDLER FACTORY
////////////////////////////////////////////////// */
exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) { //if it's null
        return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc,
        },
    });
});

/* //////////////////////////////////////////////////
DELETE ONE, HANDLER FACTORY
////////////////////////////////////////////////// */
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) { //if it's null
        return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

/* //////////////////////////////////////////////////
PATCH ONE, HANDLER FACTORY
////////////////////////////////////////////////// */
exports.patchOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true, //should match Schema/Model type
    });

    if (!doc) { //if it's null
        return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            data: doc,
        },
    });
});

/* //////////////////////////////////////////////////
CREATE ONE, HANDLER FACTORY
////////////////////////////////////////////////// */
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
            status: "success",
            data: {
                data: newDoc,
            }
    });
});