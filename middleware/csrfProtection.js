const crypto = require("crypto");
const AppError = require("../utils/appError");

function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
}

exports.csrfProtection = (req, res, next) => {
  const csrfToken = generateCsrfToken();
  res.cookie("csrfToken", csrfToken, {
    httpOnly: true,
    sameSite: "Strict",
  }); // Envia o token CSRF como um cookie
  res.locals.csrfToken = csrfToken;
  next();
};

exports.checkCsrf = (req, res, next) => {
  const submittedToken = req.body.csrfToken;
  const cookieToken = req.cookies.csrfToken; // Obtenha o token do cookie

  if (!submittedToken || submittedToken !== cookieToken) {
    return next(new AppError("invalid request!", 403));
  }

  if (!req.body.data) {
    req.body.csrfToken = undefined;
  } else req.body = req.body.data;

  next();
};
