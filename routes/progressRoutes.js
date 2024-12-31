/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllProgress, createProgress, getProgress, patchProgress, deleteProgress, getMyProgress} = require("../controllers/progressController");
const {getMe} = require("../controllers/userController");
const {protect, restrictTo} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
PROGRESS ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router();

router.route("/")
    .get(protect, restrictTo("admin"), getAllProgress)
    .post(protect, restrictTo("admin"), createProgress);

router.route("/my-progress")
    .get(protect, restrictTo("admin", "user"), getMe, getMyProgress); //for development only, user will use frontent to get their progress

router.route("/:id")
    .get(protect, restrictTo("admin"), getProgress)
    .patch(protect, restrictTo("admin"), patchProgress)
    .delete(protect, restrictTo("admin"), deleteProgress);

module.exports = router;