const { query, validationResult, body } = require("express-validator");
const AppError = require("../utils/appError");

exports.validateSearchQuery = [
  query("search").optional().trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) next(new AppError("invalid search query!", 400));

    next();
  },
];

exports.quizValidators = [
  body("name").isString().escape(),
  body("category").isString().escape(),
  body("description").isString().escape(),
  body("difficulty").isString().escape(),
  body("questions.*.question").isString().escape(),
  body("questions.*.answers.*").isString().escape(),
];

exports.validateAndProcess = (req, res, next) => {
  // Validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

exports.checkEmail = (optional = false) => {
  if (optional) {
    return body("email").optional().isEmail();
  }

  return body("email").isEmail();
};
