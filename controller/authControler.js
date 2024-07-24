const User = require("../models/userModel");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const singToken = (id, refresh = false) => {
  if (!refresh) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      //Esta opcao serve para dizer por quanto tempo o token sera valido, ou seja assim que acabar a validade o user sera logout
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

/**
 *
 * @param {object} user userDocument
 * @param {number} statusCode
 * @param {object} res response Object
 * @param {boolean} sendResponse True by defualt. if false won´t send the response to the client
 *
 */
const createSendToken = function (user, statusCode, res, sendResponse = true) {
  const token = singToken(user._id);

  //Aqui nos iremos implementar cookies, eles sao texto que nos envimos com alguma informaçao sensivel que apenas o navegador pode acessar e nao pode ser modificado
  //Ex nosso json web token

  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIES_EXPIRES_IN) * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  if (sendResponse) {
    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  }
};

exports.singup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //verify if email and password are exist
  if (!email || !password)
    return next(new AppError("missing email or password!", 400));
  console.log(email);
  const user = await User.findOne({ email: email }).select("+password");

  //check if email exist and password is correct
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("incorrect email or password!", 400));

  // if everything is correct send access token
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 500),
    secure: true,
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie("jwt", "logout", cookieOptions);
  res.status(200).send("loging out");
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError("you are not logged in!", 401));
  //verification token
  //Aqui nos iremos verificar se o token e valido usando o verify que aceita como primeiro argumento o token e segundo o secret
  //E como terceiro argumento uma callback function que é executada assim que sua acao for finalizada ou seja este verify é um aync method
  //como nos estamos usando async await nos podemos promissify este metodo
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError("the user belonging to this token no loger exist", 401)
    );

  //cheke if the user change password after the token was issued
  //Aqui nos checamos se o usuario mudou a senha depois do toker ter sido emitido, neste caso
  // nos nao quermos liberar o accesso a  este usuario
  //no fazemos isso usando o instace metodo que nos criamos e passomos nele o timestamp de quando o token foi criado

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError("User recently chanded password!, please log in again", 401)
    );

  //granted access to the protected route
  //caso tenha checado ate sem erro significa que podemos liberar o acesso ao user
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.isLoggedIn = async function (req, res, next) {
  if (req.cookies?.jwt) {
    //verification token
    //Aqui nos iremos verificar se o token e valido usando o verify que aceita como primeiro argumento o token e segundo o secret
    //E como terceiro argumento uma callback function que é executada assim que sua acao for finalizada ou seja este verify é um aync method
    //como nos estamos usando async await nos podemos promissify este metodo
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //check if the user still exist
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      //cheke if the user change password after the token was issued
      //Aqui nos checamos se o usuario mudou a senha depois do toker ter sido emitido, neste caso
      // nos nao quermos liberar o accesso a  este usuario
      //no fazemos isso usando o instace metodo que nos criamos e passomos nele o timestamp de quando o token foi criado

      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      //granted access to the protected route
      //caso tenha checado ate sem erro significa que podemos liberar o acesso ao user
      //There is a logged in user
      //nos usamos req.locals.user para ter  acesso ao user em nossos templates
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      console.log(err);
      return next();
    }
  }
  return next();
};
