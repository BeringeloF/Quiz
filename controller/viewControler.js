const Quiz = require("../models/quizModel");
const AppError = require("../utils/appError");

exports.getOverview = async (req, res, next) => {
  let filter;

  if (req.query.search) {
    filter = { $text: { $search: req.query.search } };
  }

  let page = (+req.query.page || 1) - 1;

  if (page < 0) page = 0;

  const limit = 9;

  const quizes = await Quiz.find(filter)
    .skip(page * limit)
    .limit(limit + 1);

  if (quizes.length === 0) {
    return next(
      new AppError("Oops! The page you are looking for does not exist.", 404)
    );
  }

  let lastPage;

  if (quizes.length !== 10) {
    lastPage = true;
  }
  page++;

  res.status(200).render("overview", {
    title: "Quiz Overview",
    quizes: quizes.slice(0, 9),
    lastPage,
    page,
  });
};

exports.getQuizPage = async (req, res, next) => {
  const quiz = await Quiz.findOne({ slug: req.params.slug });
  res.status(200).render("quiz", {
    title: "Quiz",
    quiz,
  });
};

exports.getLoginForm = async (req, res, next) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getSingupForm = async (req, res, next) => {
  res.status(200).render("singup", {
    title: "Sing Up",
  });
};

exports.getUserDetails = async (req, res, next) => {
  res.status(200).render("userDetails", {
    title: "Account",
  });
};

exports.getChangePassword = async (req, res, next) => {
  res.status(200).render("changePassword", {
    title: "Change Password",
  });
};

exports.getCreateQuizForm = async (req, res, next) => {
  res.status(200).render("createQuiz", {
    title: "Create your own quiz",
  });
};

exports.getManageQuiz = async (req, res, next) => {
  let filter = {};

  if (req.user.role !== "admin") {
    filter = {
      "author.user": req.user._id,
    };
  }

  let page = (+req.query.page || 1) - 1;

  if (page < 0) page = 0;

  const limit = 10;

  const quizes = await Quiz.find(filter)
    .skip(page * limit)
    .limit(limit + 1);

  if (quizes.length === 0) {
    return next(
      new AppError("Oops! The page you are looking for does not exist.", 404)
    );
  }

  let lastPage;

  if (quizes.length !== 11) {
    lastPage = true;
  }
  page++;

  res.status(200).render("manageQuiz", {
    title: "Manage Quizzes",
    quizzes: quizes.slice(0, 10),
    lastPage,
    page,
  });
};

exports.getEditQuiz = async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);

  res.status(200).render("editQuiz", {
    title: "Edit Quiz",
    quiz,
  });
};

exports.getFiveMostPopular = async (req, res, next) => {
  const quizes = await Quiz.find().sort("-views").limit(5);
  console.log(quizes);
  res.status(200).render("overview", {
    title: "Five most popular quizzes",
    quizes,
    lastPage: true,
  });
};
