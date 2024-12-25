/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllContracts, createContract, getContract, patchContract, deleteContract} = require("../controllers/contractController");
const {protect, restrictTo} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
CONTRACT ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router();

router.route("/")
    .get(protect, restrictTo("admin"), getAllContracts)
    .post(protect, restrictTo("admin"), createContract);

router.route("/:id")
    .get(protect, restrictTo("admin"), getContract)
    .patch(protect, restrictTo("admin"), patchContract)
    .delete(protect, restrictTo("admin"), deleteContract);

module.exports = router;