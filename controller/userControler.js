const User = require("../models/userModel");
const Quiz = require("../models/quizModel");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/APIFeatures");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",

    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.userId);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "this route is not suposed to be used to change password!",
        400
      )
    );

  const { email, name } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { email, name },
    {
      new: true,
      //esta opcao serve para dizer que queremos o documento novo/atuaizado seja retornado para o cliente
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const multerStorage = multer.memoryStorage();

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image!, please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserImage = upload.single("photo");

//Agora nos iremos processar o foto para deixa-la no formato em que queremos, neste caso um quadrado, para isso nos usares o sharp
exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg") //Serve para converter a imagem para um tipo especifico
    .jpeg({ quality: 90 }) //disponivel para imagens jpeg, aceita um objeto de opcoes entre elas quality que serve para especificar a qualidade da imagem
    .toFile(`public/img/${req.file.filename}`); //Serve para  salvar o imagem processada no destino que especificarmos

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "this route is not suposed to be used to change password!",
        400
      )
    );

  const obj = {};

  if (req.file) obj.photo = req.file.filename;

  console.log(obj);

  const user = await User.findByIdAndUpdate(req.user._id, obj, {
    new: true,
    //esta opcao serve para dizer que queremos o documento novo/atuaizado seja retornado para o cliente
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.saveQuizHistory = catchAsync(async (req, res, next) => {
  const { quizId, correctAnswers, totalQuestions } = req.body;

  const quiz = await Quiz.findById(quizId);

  const user = await User.findById(req.user._id);

  if (!user.history) user.history = [];

  user.history.push({
    quiz: quiz._id,
    correctAnswers,
    totalQuestions,
    completedAt: Date.now(),
  });
  user.increseExpAndLevel(quiz.difficulty, correctAnswers);

  await user.save({ validateBeforeSave: false });
});
