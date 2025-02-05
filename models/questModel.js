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
            enum: {
                values: ["easy", "medium", "hard"],
                message: "Difficulty is either: easy, medium, hard."
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
            money: {
                type: Number,
                required: [true, "A quest must have a reward."],
                default: 1000,
                min: [500, "Reward must be at least 500."],
                max: [200000, "Reward must not exceed 200000."], 
            },
            experience: {
                type: Number,
                required: [true, "A quest must give some global/guild experience."],
                min: [100, "Global/guild experience gained must be above 100."],
                max: [200000, "Global/guild experience gained must be below 200000."],
            },
            attributes: {
                strength: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                stamina: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                dexterity: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                speed: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                vitality: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                agility: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                intelligence: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                charisma: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                wisdom: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                perception: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                focus: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
                willpower: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5
                },
            },
        },
        guilds: [{
            type: mongoose.Schema.ObjectId,
            ref: "Guild",
            required: [true, "A quest must belong to at least one guild."]
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
questSchema.index({
    slug: 1
});
questSchema.index({ guilds: 1 });
questSchema.index({ guilds: 1, difficulty: 1 });
questSchema.index({ guilds: 1, duration: 1 });
questSchema.index({ guilds: 1, reward: 1 });
questSchema.index({ guilds: 1, experience: 1 });

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