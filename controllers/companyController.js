/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const multer = require("multer");
const sharp = require("sharp");
const Company = require("./../models/companyModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
MIDDLEWARES
████████████████████████████████████████████████████████████████████████████████████████████████████ 
*/
/* //////////////////////////////////////////////////
MULTER TO UPLOAD COMPANY IMAGES
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

exports.uploadCompanyImages = multerUpload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

exports.resizeCompanyImages = catchAsync(async (req, res, next) => {
    if(req.files.imageCover) {
        req.body.imageCover = `company-${req.params.id}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({quality: 90})
            .toFile(`public/img/companies/${req.body.imageCover}`);
    };

    if(req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `company-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat("jpeg")
                    .jpeg({quality: 90})
                    .toFile(`public/img/companies/${filename}`);

                req.body.images.push(filename);
            })
        );
    };

    next();
});

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
COMPANIES ROUTE HANDLERS
████████████████████████████████████████████████████████████████████████████████████████████████████ */
/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET ALL COMPANIES
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getAllCompanies = factory.getAll(Company);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GET COMPANY BY ID
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.getCompany = factory.getOne(Company);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
CREATE NEW COMPANY
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.createCompany = factory.createOne(Company);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
PATCH COMPANY (need ID)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.patchCompany = factory.patchOne(Company);

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
DELETE COMPANY (need id)
//////////////////////////////////////////////////////////////////////////////////////////////////// */
exports.deleteCompany = factory.deleteOne(Company);