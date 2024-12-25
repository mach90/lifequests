/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const express = require("express");
const {getAllCompanies, createCompany, getCompany, patchCompany, deleteCompany, uploadCompanyImages, resizeCompanyImages} = require("../controllers/companyController");
const {protect, restrictTo} = require("../controllers/authController");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
COMPANY ROUTER
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const router = express.Router();

router.route("/")
    .get(getAllCompanies)
    .post(protect, restrictTo("admin"), createCompany);

router.route("/:id")
    .get(getCompany)
    .patch(protect, restrictTo("admin"), uploadCompanyImages, resizeCompanyImages, patchCompany)
    .delete(protect, restrictTo("admin"), deleteCompany); 

module.exports = router;