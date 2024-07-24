const express = require("express");
const quizControler = require("../controller/quizControler");
const authControler = require("../controller/authControler");
const { checkCsrf } = require("../middleware/csrfProtection");
const {
  quizValidators,
  validateAndProcess,
} = require("../middleware/validate");

const router = express.Router();

router.route("/").get(quizControler.getAllQuiz).post(
  authControler.protect,
  quizControler.uploadQuizImage, //Quando vc for lidar com multipartData vc deve usar um middleware que fassa o parse deste data
  //caso contrario vc nao tera acesso a ele, por exemplo antes de vc fazer o parse o req.body estara vazio. Entao o que middleware
  //uploadQuizImage faz nao é apenas o upload da imagem mais sim tambem o parse do data do formulario
  checkCsrf,
  quizValidators,
  validateAndProcess,
  quizControler.resizeQuizImage,
  quizControler.createQuiz
);

router
  .route("/:quizId")
  .get(quizControler.getQuiz)
  .patch(
    authControler.protect,
    quizControler.uploadQuizImage, //Parse do data e upload da image
    checkCsrf,
    quizValidators,
    validateAndProcess,
    quizControler.resizeQuizImage,
    quizControler.updateQuiz
  )
  .delete(authControler.protect, checkCsrf, quizControler.deleteQuiz);

module.exports = router;
