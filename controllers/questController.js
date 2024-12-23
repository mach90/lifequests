/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const multer = require("multer");
const sharp = require("sharp");
const Quest = require("./../models/questModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ 
*/
/* //////////////////////////////////////////////////
MULTER TO UPLOAD TOUR IMAGES
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

exports.uploadQuestImages = multerUpload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

exports.resizeQuestImages = catchAsync(async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `quest-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({quality: 90})
        .toFile(`public/img/quests/${req.body.imageCover}`);

    req.body.images = [];
    
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `quest-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({quality: 90})
                .toFile(`public/img/quests/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
QUESTS ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL QUESTS
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllQuests = factory.getAll(Quest);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET QUEST BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getQuest = factory.getOne(Quest);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE NEW QUEST
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createQuest = factory.createOne(Quest);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH QUEST (need ID)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchQuest = factory.patchOne(Quest);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE QUEST (need id)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteQuest = factory.deleteOne(Quest);