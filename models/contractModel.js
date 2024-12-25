const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
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
});

contractSchema.pre(/^find/, function(next){
    this.populate("user").populate({
        path: "quest",
        select: "name"
    });
    next();
})

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;