/* //////////////////////////////////////////////////
REQUIRE
////////////////////////////////////////////////// */
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/* //////////////////////////////////////////////////
USER SCHEMA
////////////////////////////////////////////////// */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Your name is required."],
            trim: true,
            maxlength: [16, "Username can't exceed 16 characters."],
            minlength: [3, "Username must have at least 3 characters."],
        },
        email: {
            type: String,
            require: [true, "Your email is required"],
            unique: [true, "This email is already used."],
            lowercase: true,
            validate: [validator.isEmail, "Please provide a valid email."]
        },
        photo: {
            type: String,
            default: "default.jpg"
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user" 
        },
        settings: {
            theme: {
                type: String,
                enum: ["system", "light", "dark"],
                default: "dark"
            },
            displayExperience: {
                type: String,
                enum: ["classic", "remaining"],
                default: "classic"
            },
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
            max: 30225276,
        },
        attributes: {
            strength: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            stamina: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            dexterity: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            speed: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            vitality: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            agility: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            intelligence: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            charisma: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            wisdom: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            perception: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            focus: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            willpower: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
        },
        money: {
            type: Number,
                default: 0,
                min: 0,
        },
        password: {
            type: String,
            required: [true, "Please choose a password."],
            minlength: [8, "Password must have at least 8 characters."],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password."],
            minlength: [8, "Password must have at least 8 characters."],
            validate: {
                //only works on create or save, not on patch
                validator: function(el) {
                    return el === this.password;
                },
                message: "Passwords are not the same."
            },
            select: false,
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
    }
);

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
ENCRYPTING PASSWORD
npm i bcryptjs
The number, the cost, defines how CPU intensive the operation will be, how strong the encryption will be
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.pre("save", async function(next) {
    //only run if password was modified or created
    if(!this.isModified("password")) return next();

    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete the passwordConfirm field
    this.passwordConfirm = undefined;

    next();
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To change the "changedPasswordAt" before the document is actually saved
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.pre("save", function(next) {
    if(!this.isModified("password") || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() - 50000; 
    //- 5000ms ensure that the token is created after the passwordChangedAt timestamp (token takes more time)
    next();
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To not show inactive user in Get all users
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.pre(/^find/, function(next) {
    this.find({active: {$ne: false}});
    next();
});

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To cap values when updateMyCharacter uses findOneAndUpdate to inc character money, exp, attributes
Ensures experience, money and attributes stay within their bounds even with $inc operations
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.pre('findOneAndUpdate', function(next) {
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

                // Handle money
                if (update.$inc.money) {
                    let newMoney = (doc.money || 0) + update.$inc.money;
                    if (newMoney < 0) {
                        update.$set = { ...update.$set, money: 0 };
                        delete update.$inc.money;
                    }
                }

                // Handle attributes
                if (update.$inc) {
                    Object.keys(update.$inc).forEach(key => {
                        if (key.startsWith('attributes.')) {
                            const attrName = key.split('.')[1];
                            const currentValue = doc.attributes[attrName] || 0;
                            const increment = update.$inc[key];
                            const newValue = currentValue + increment;

                            if (newValue > 100) {
                                update.$set = { ...update.$set, [key]: 100 };
                                delete update.$inc[key];
                            }
                        }
                    });
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

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
INSTANCE METHODS (Methods available on all documents of a certain collection)
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To check if entered password match user password saved in db
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    /* Will return true if both password are identical, 
    it will encrypt the candidatePassword and compare it to 
    the already encrypted userPassword */
    return await bcrypt.compare(candidatePassword, userPassword);
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To check if the password has been changed after the jwt was created
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const passwordChangedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(passwordChangedAtTimestamp, JWTTimestamp);
        return JWTTimestamp < passwordChangedAtTimestamp;
    }

    return false;
}

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
To generate a random reset password token
Not hashed because time limit is very short
//////////////////////////////////////////////////////////////////////////////////////////////////// */
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 min
    return resetToken;
}

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
USER MODEL
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const User = mongoose.model("User", userSchema);

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MODULE.EXPORTS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
module.exports = User;