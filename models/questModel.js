/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
QUEST SCHEMA
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const questSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A quest must have a name."],
            unique: true,
            trim: true,
            maxlength: [40, "A quest name must have less or equal then 40 characters."],
            minlength: [3, "A quest name must have more or equal then 3 characters."],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, "A quest must have a duration."]
        },
        difficulty: {
            type: String,
            required: [true, "A quest must have a difficulty level."],
            enum: { //only for strings
                values: ["easy", "medium", "difficult"],
                message: "Difficulty is either: easy, medium, difficult."
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, "A quest must have a summary."]
        },
        description: {
            type: String,
            trim: true,
            required: [true, "A quest must have a description."]
        },
        imageCover: {
            type: String,
            required: [true, "A quest must have a cover image."]
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        reward: {
            type: Number,
            required: [true, "A quest must have a reward."],
            default: 1000,
            min: [500, "Reward must be at least 500."],
            max: [200000, "Reward must not exceed 200000."], 
        },
        experience: {
            type: Number,
            required: [true, "A quest must give some experience."],
            min: [100, "Experience gained must be above 100."],
            max: [200000, "Experience gained must be below 200000."],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
INDEXES. 1 = ascending, -1 = descending
//////////////////////////////////////////////////////////////////////////////////////////////////// */
questSchema.index({
    slug: 1
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
MIDDLEWARE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
questSchema.pre("save", function(next) { 
    this.slug = slugify(this.name, { lower: true });
    next();
}); 

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
QUEST MODEL
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const Quest = mongoose.model("Quest", questSchema);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
module.exports = Quest;