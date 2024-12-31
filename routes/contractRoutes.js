/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllContracts, createContract, getContract, patchContract, deleteContract, getMyContracts} = require("../controllers/contractController");
const {getMe} = require("../controllers/userController");
const {protect, restrictTo} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
CONTRACT ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router();

router.route("/")
    .get(protect, restrictTo("admin"), getAllContracts)
    .post(protect, restrictTo("admin"), createContract);

router.route("/my-contracts")
    .get(protect, restrictTo("admin", "user"), getMe, getMyContracts); //for development only, user will use frontent to get their contracts

router.route("/:id")
    .get(protect, restrictTo("admin"), getContract)
    .patch(protect, restrictTo("admin"), patchContract)
    .delete(protect, restrictTo("admin"), deleteContract);


module.exports = router;