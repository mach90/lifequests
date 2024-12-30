/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllProgress, createProgress, getProgress, patchProgress, deleteProgress} = require("../controllers/progressController");
const {protect, restrictTo} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
PROGRESS ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router();

router.route("/")
    .get(protect, restrictTo("admin"), getAllProgress)
    .post(protect, restrictTo("admin"), createProgress);

router.route("/:id")
    .get(protect, restrictTo("admin"), getProgress)
    .patch(protect, restrictTo("admin"), patchProgress)
    .delete(protect, restrictTo("admin"), deleteProgress);

module.exports = router;