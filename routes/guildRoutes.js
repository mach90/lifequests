/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const express = require("express");
const {getAllGuilds, createGuild, getGuild, patchGuild, deleteGuild, uploadGuildImages, resizeGuildImages, getAllGuildQuests} = require("../controllers/guildController");
const {protect, restrictTo} = require("../controllers/authController");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
GUILD ROUTER
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const router = express.Router();

router.route("/")
    .get(getAllGuilds)
    .post(protect, restrictTo("admin"), createGuild);

router.route("/:id")
    .get(getGuild)
    .patch(protect, restrictTo("admin"), uploadGuildImages, resizeGuildImages, patchGuild)
    .delete(protect, restrictTo("admin"), deleteGuild); 

router.route("/:id/quests")
    .get(getAllGuildQuests);

module.exports = router;