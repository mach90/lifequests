/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllSkillsets, createSkillset, getSkillset, patchSkillset, deleteSkillset, getMySkillset, createMySkillset, patchMySkillset} = require("../controllers/skillsetController");
const {getMe} = require("../controllers/userController");
const {protect, restrictTo} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
SKILLSET ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router();

router.route("/my-skillset")
    .get(protect, restrictTo("admin", "user"), getMe, getMySkillset)
    .post(protect, restrictTo("admin", "user"), getMe, createMySkillset)
    .patch(protect, restrictTo("admin", "user"), getMe, patchMySkillset);
    
router.route("/")
    .get(protect, restrictTo("admin"), getAllSkillsets)
    .post(protect, restrictTo("admin"), createSkillset);

router.route("/:id")
    .get(protect, restrictTo("admin"), getSkillset)
    .patch(protect, restrictTo("admin"), patchSkillset)
    .delete(protect, restrictTo("admin"), deleteSkillset);


module.exports = router;