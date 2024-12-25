/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const multer = require("multer");
const sharp = require("sharp");
const Guild = require("./../models/guildModel");
const Quest = require("./../models/questModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ 
*/
/* //////////////////////////////////////////////////
MULTER TO UPLOAD GUILD IMAGES
////////////////////////////////////////////////// */
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new AppError("Only images are allowed to be upload.", 400), false);
    }
}

const multerUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadGuildImages = multerUpload.fields([
    {name: "imageCover", maxCount: 1},
    {name: "images", maxCount: 3}
]);

exports.resizeGuildImages = catchAsync(async (req, res, next) => {
    if(req.files.imageCover) {
        req.body.imageCover = `guild-${req.params.id}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({quality: 90})
            .toFile(`public/img/guilds/${req.body.imageCover}`);
    };

    if(req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `guild-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat("jpeg")
                    .jpeg({quality: 90})
                    .toFile(`public/img/guilds/${filename}`);

                req.body.images.push(filename);
            })
        );
    };

    next();
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
GUILDS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL GUILDS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllGuilds = factory.getAll(Guild);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET GUILD BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getGuild = factory.getOne(Guild);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE NEW GUILD
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createGuild = factory.createOne(Guild);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH GUILD (need ID)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchGuild = factory.patchOne(Guild);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE GUILD (need id)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteGuild = factory.deleteOne(Guild);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET GUILD'S QUESTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllGuildQuests = catchAsync(async (req, res, next) => {
    const guild = await Guild.findById(req.params.id);

    if (!guild) {
        return next(new AppError("No guild found with that ID", 404));
    }

    const query = Quest.find({ guilds: req.params.id });

    // // Add any filters from req.query
    // // Add sorting if needed
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(",").join(" ");
    //     query.sort(sortBy);
    // }

    const quests = await query;

    res.status(200).json({
        status: "success",
        results: quests.length,
        data: {
            quests
        }
    });
});