const express = require("express");
const viewControler = require("../controller/viewControler");
const authControler = require("../controller/authControler");
const { validateSearchQuery } = require("../middleware/validate");
const { csrfProtection } = require("../middleware/csrfProtection");

const router = express.Router();

router.use(authControler.isLoggedIn);

router.get("/", validateSearchQuery, viewControler.getOverview);

router.get("/quiz/:slug", viewControler.getQuizPage);

router.get("/login", viewControler.getLoginForm);
router.get("/singup", viewControler.getSingupForm);

router.get("/userDetails", authControler.protect, viewControler.getUserDetails);

router.get(
  "/createQuiz",
  csrfProtection,
  authControler.protect,
  viewControler.getCreateQuizForm
);

// router.get("/error", viewControler.getError);
router.get(
  "/manageQuiz",
  authControler.protect,
  csrfProtection,
  viewControler.getManageQuiz
);
router.get(
  "/editQuiz/:quizId",
  authControler.protect,
  csrfProtection,
  viewControler.getEditQuiz
);

router.get(
  "/changePassword",
  csrfProtection,
  authControler.protect,
  viewControler.getChangePassword
);

router.get("/top-five-most-popular", viewControler.getFiveMostPopular);

module.exports = router;
