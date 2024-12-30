/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const mongoose = require("mongoose");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CONTRACT SCHEMA
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const contractSchema = new mongoose.Schema(
    {
        quest: {
            type: mongoose.Schema.ObjectId,
            ref: "Quest",
            required: [true, "A contract must belong to a quest."]
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "A contract must belong to a user."]
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        status: {
            type: String,
            required: [true, "A contract must have a status."],
            enum: {
                values: ["active", "finished"],
                message: "Status is either: active, finished."
            }
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
INDEXES. 1 = ascending, -1 = descending
//////////////////////////////////////////////////////////////////////////////////////////////////// */
contractSchema.index({ user: 1, quest: 1 }, { unique: true });
contractSchema.index({ user: 1, createdAt: -1 });
contractSchema.index({ quest: 1, status: 1 });
contractSchema.index({ status: 1, createdAt: -1 });
contractSchema.index({ user: 1, status: 1, createdAt: -1 });

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
MIDDLEWARE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
contractSchema.pre(/^find/, function(next){
    this.populate({
        path: "user",
        select: "name"
    }).populate({
        path: "quest",
        select: "name"
    });
    next();
})

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CONTRACT MODEL
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const Contract = mongoose.model("Contract", contractSchema);


/* ////////////////////////////////////////////////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
module.exports = Contract;