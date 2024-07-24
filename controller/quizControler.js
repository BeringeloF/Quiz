const Quiz = require("../models/quizModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const sharp = require("sharp");

exports.getAllQuiz = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Quiz.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const quizzes = await features.query;

  res.status(200).json({
    status: "success",
    results: quizzes.length,
    data: {
      quizzes,
    },
  });
});
exports.getQuiz = catchAsync(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) return next(new AppError("no quiz found with that id!", 400));

  res.status(200).json({
    status: "success",
    data: {
      quiz,
    },
  });
});

//Este filtro serve pra garantir que os unicos files que estao sendo carregados sao imagens
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image!, please upload only images", 400), false);
  }
};

//Agora para salvar apenas na memoria com um buffer nos fazer assim
//Entao a imagem estara salva em req.file.buffer

const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadQuizImage = upload.single("imageCover");

//Agora nos iremos processar o foto para deixa-la no formato em que queremos, neste caso um quadrado, para isso nos usares o sharp
exports.resizeQuizImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg") //Serve para converter a imagem para um tipo especifico
    .jpeg({ quality: 90 }) //disponivel para imagens jpeg, aceita um objeto de opcoes entre elas quality que serve para especificar a qualidade da imagem
    .toFile(`public/img/${req.file.filename}`); //Serve para  salvar o imagem processada no destino que especificarmos
  console.log(req.file.buffer);
  next();
});

exports.createQuiz = catchAsync(async (req, res, next) => {
  //checkin if there is a image if so, set the imageCover propertie
  if (req.file) req.body.imageCover = req.file.filename;

  console.log(req.user);
  //checking if  is logged in and the authorName and the user propertie exist, if not setting it by the user info
  if (req.user && !req.body.author)
    req.body.author = { authorName: req.user.name, user: req.user._id };

  if (req.headers["content-type"].includes("multipart/form-data")) {
    console.log(req.body);
    req.body.questions = JSON.parse(
      req.body.questions[req.body.questions.length - 1]
    );
    console.log(req.body);
  }

  const quiz = await Quiz.create(req.body);

  res.status(201).json({
    status: "success",
    message: "quiz created successfuly!",
    data: {
      quiz,
    },
  });
});

exports.updateQuiz = catchAsync(async (req, res, next) => {
  //making sure that this field will keep its current value when updating the quiz
  req.body.createdAt = undefined;

  if (req.file) req.body.imageCover = req.file.filename;

  let quiz;
  console.log(req.body);
  if (req.body.views) {
    quiz = await Quiz.findById(req.params.quizId);
    quiz.views++;
    quiz.save();
  } else {
    if (
      !Array.isArray(req.body.questions) &&
      req.body.questions !== undefined
    ) {
      req.body.questions = JSON.parse(req.body.questions);
    }
    console.log(req.body);
    quiz = await Quiz.findByIdAndUpdate(req.params.quizId, req.body, {
      new: true,
      //esta opcao serve para dizer que queremos o documento novo/atuaizado seja retornado para o cliente
      runValidators: true,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      quiz,
    },
  });
});

exports.deleteQuiz = catchAsync(async (req, res, next) => {
  await Quiz.findByIdAndDelete(req.params.quizId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//{ $text: { $search: "your search text" } }
