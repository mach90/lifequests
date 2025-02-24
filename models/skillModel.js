/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const mongoose = require("mongoose");
const slugify = require("slugify");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
SKILL SCHEMA
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A skill must have a name."],
            unique: true,
            trim: true,
            maxlength: [20, "A skill name must have less or equal than 20 characters."],
            minlength: [3, "A skill name must have more or equal than 3 characters."],
        },
        slug: String,
        description: {
            type: String,
            trim: true,
            required: [true, "A skill must have a description."]
        },
        category: {
            type: String,
            required: [true, "A skill must have a category."],
            enum: {
                values: ["technical", "social", "physical", "fourth", "fifth"],
                message: "Category is either: technical, social, physical, fourth, fifth."
            }
        },
        level: {
            type: Number,
            required: [true, "A skill must have a level."],
            enum: {
                values: [1, 2, 3, 4, 5],
                message: "Skill level is either: 1, 2, 3, 4, 5."
            }
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        guilds: [{
            type: mongoose.Schema.ObjectId,
            ref: "Guild",
            required: [true, "A skill must belong to at least one guild."]
        }],
    },
    {
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true }
    }
);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
INDEXES. 1 = ascending, -1 = descending
//////////////////////////////////////////////////////////////////////////////////////////////////// */
skillSchema.index({ name: 1, description: 1 });

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
MIDDLEWARE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
skillSchema.pre("save", function(next) { 
    this.slug = slugify(this.name, { lower: true });
    next();
}); 

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
SKILL MODEL
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const Skill = mongoose.model("Skill", skillSchema);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
module.exports = Skill;