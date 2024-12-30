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
        level: {
            type: Number,
            default: 1,
            min:1,
            max:200,
        },
        experience: {
            type: Number,
            default: 0,
            min: 0,
            max: 999999999,
        },
        attributes: {
            strength: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            stamina: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            dexterity: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            speed: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            vitality: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            agility: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            intelligence: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            charisma: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            wisdom: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            perception: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            focus: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
            },
            willpower: {
                type: Number,
                default: 0,
                min: 0,
                max: 255
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