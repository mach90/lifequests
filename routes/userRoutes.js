/* ████████████████████████████████████████████████████████████████████████████████████████████████████
REQUIRE
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const express = require("express"); //nodejs framework
const {getAllUsers, getUser, patchUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto, updateMyCharacter} = require("../controllers/userController");
const {signup, login, protect, forgotPassword, resetPassword, updatePassword, restrictTo, logout} = require("../controllers/authController");

/* ████████████████████████████████████████████████████████████████████████████████████████████████████
USER ROUTER
████████████████████████████████████████████████████████████████████████████████████████████████████ */
const router = express.Router(); //router

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.get("/me", protect, getMe, getUser);
router.patch("/updateMyPassword", protect, updatePassword);
router.patch("/updateMe", protect, uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete("/deleteMe", protect, deleteMe);
router.patch("/updateMyCharacter", protect, updateMyCharacter);

router.route("/")
    .get(protect, restrictTo("admin"), getAllUsers);

router.route("/:id")
    .get(protect, restrictTo("admin"), getUser)
    .patch(protect, restrictTo("admin"), patchUser)
    .delete(protect, restrictTo("admin"), deleteUser);

module.exports = router;