/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const mongoose = require("mongoose");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PROGRESS SCHEMA
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const progressSchema = new mongoose.Schema(
    {
        guild: {
            type: mongoose.Schema.ObjectId,
            ref: "Guild",
            required: [true, "A guild progress must belong to a guild."]
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "A guild progress must belong to a user."]
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
            max: 30225276,
        },
        // level: {
        //     type: Number,
        //     default: 1,
        //     min:1,
        //     max:200,
        // },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
INDEXES. 1 = ascending, -1 = descending
//////////////////////////////////////////////////////////////////////////////////////////////////// */
progressSchema.index({ user: 1, guild: 1 }, { unique: true });

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
MIDDLEWARE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
progressSchema.pre(/^find/, function(next){
    this.populate({
        path: "user",
        select: "name"
    }).populate({
        path: "guild",
        select: "name"
    });
    next();
});

progressSchema.pre("findOneAndUpdate", function(next) {
    const update = this.getUpdate();

    if (update.$inc) {
        this.model.findOne(this.getQuery())
            .then(doc => {
                if (!doc) return next();

                // Handle experience
                if (update.$inc.experience) {
                    let newExp = (doc.experience || 0) + update.$inc.experience;
                    if (newExp > 30225276) {
                        update.$set = { ...update.$set, experience: 30225276 };
                        delete update.$inc.experience;
                    }
                }

                // If all $inc operations were converted to $set, remove $inc to avoid errors
                if (Object.keys(update.$inc).length === 0) {
                    delete update.$inc;
                }

                next();
            })
            .catch(err => next(err));
    } else {
        next();
    }
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PROGRESS MODEL
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const Progress = mongoose.model("Progress", progressSchema);


/* ////////////////////////////////////////////////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
module.exports = Progress;