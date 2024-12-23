/* ////////////////////////////////////////////////////////////////////////////////////////////////////
REQUIRE
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const express = require("express");
const {getAllQuests, createQuest, getQuest, patchQuest, deleteQuest, uploadQuestImages, resizeQuestImages} = require("../controllers/questController");
const {protect, restrictTo} = require("../controllers/authController");

/* ////////////////////////////////////////////////////////////////////////////////////////////////////
QUEST ROUTER
//////////////////////////////////////////////////////////////////////////////////////////////////// */
const router = express.Router();

router.route("/")
    .get(getAllQuests)
    .post(protect, restrictTo("admin"), createQuest);

router.route("/:id")
    .get(getQuest)
    .patch(protect, restrictTo("admin"), uploadQuestImages, resizeQuestImages, patchQuest)
    .delete(protect, restrictTo("admin"), deleteQuest); 

module.exports = router;