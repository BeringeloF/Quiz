const express = require("express");
const userControler = require("../controller/userControler");
const authControler = require("../controller/authControler");
const { checkEmail } = require("../middleware/validate");
const { checkCsrf } = require("../middleware/csrfProtection");

const router = express.Router();

router.get("/", userControler.getAllUsers);

router.post("/register", checkEmail(), authControler.singup);
router.post("/login", checkEmail(), authControler.login);
router.get("/logout", authControler.logout);
router.post(
  "/saveQuizHistory",
  authControler.protect,
  checkCsrf,
  userControler.saveQuizHistory
);

router.patch(
  "/updatePassword",
  authControler.protect,
  authControler.updatePassword
);

router.patch(
  "/updateMe",
  authControler.protect,
  userControler.uploadUserImage,
  checkCsrf, //Parse do data e upload da image
  userControler.resizeUserImage,
  userControler.updateMe
);

router
  .route("/:userId")
  .get(userControler.getUser)
  .delete(authControler.protect, userControler.deleteUser)
  .patch(authControler.protect, checkEmail(true), userControler.updateUser);

module.exports = router;
