/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express");
const {getAllContracts, createContract, getContract, patchContract, deleteContract, getMyContracts, getMyContract, createMyContract, patchMyContract, getMyContractsAfterDate} = require("../controllers/contractController");
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
    .get(protect, restrictTo("admin", "user"), getMe, getMyContracts)
    .post(protect, restrictTo("admin", "user"), getMe, createMyContract)

router.route("/my-contracts/:contractId")
    .get(protect, restrictTo("admin", "user"), getMe, getMyContract)
    .patch(protect, restrictTo("admin", "user"), getMe, patchMyContract);

router.route("/my-recent-contracts/:date")
    .get(protect, restrictTo("admin", "user"), getMe, getMyContractsAfterDate); //ISO 8601 date format YYYY-MM-DD

router.route("/:id")
    .get(protect, restrictTo("admin"), getContract)
    .patch(protect, restrictTo("admin"), patchContract)
    .delete(protect, restrictTo("admin"), deleteContract);

module.exports = router;