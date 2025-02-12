/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllProgress, createProgress, getProgress, patchProgress, deleteProgress, getAllMyProgress, getMyProgress, createMyProgress, patchMyProgress} = require("../controllers/progressController");
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
    .get(protect, restrictTo("admin", "user"), getMe, getAllMyProgress)
    .post(protect, restrictTo("admin", "user"),getMe, createMyProgress);

router.route("/my-progress/:progressId")
    .get(protect, restrictTo("admin", "user"),getMe, getMyProgress)
    .patch(protect, restrictTo("admin", "user"),getMe, patchMyProgress)


router.route("/:id")
    .get(protect, restrictTo("admin"), getProgress)
    .patch(protect, restrictTo("admin"), patchProgress)
    .delete(protect, restrictTo("admin"), deleteProgress);

module.exports = router;