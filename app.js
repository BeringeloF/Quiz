const express = require("express");
const quizRouter = require("./routes/quizRoutes");
const viewRouter = require("./routes/viewRoutes");
const userRouter = require("./routes/userRouter");
const errorControler = require("./controller/errorControler");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { sanitizeXss } = require("./middleware/sanitizeXss");
const app = express();

//setting the templetes engine
app.set("view engine", "pug");
app.set("views", `${process.env.PWD}/views`);

//parsing the body of the request
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

// app.use((req, res, next) => {
//   req.on("data", (chunk) => {
//     console.log("Chunk received:", chunk.toString());
//   });

//   req.on("end", () => {
//     console.log("Request body:", req.body);
//     console.log(req.headers);
//   });
//   next();
// });

// const upload = multer(); // Pasta onde os arquivos serão armazenados

// // Middleware para processar dados multipart/form-data
// app.use(upload.none()); // Para processar apenas campos de texto e não arquivos

app.use((req, res, next) => {
  console.log("body2", req.rawBody);
  console.log("Request Body:", req.body);
  next();
});

//sanitize xss
app.use(sanitizeXss);

//parsing the cookies
app.use(cookieParser());

//serving the statics files
app.use(express.static("./public"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//set security headers
app.use(helmet());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite qualquer origem
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Métodos permitidos
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // Cabeçalhos permitidos

  // Se for uma requisição OPTIONS, responde com status 200 (OK)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

const limiter = rateLimit({
  //max serve para limitar o maximo de request pemitadas por IP
  max: 100,
  //o windowMs serve para dizer que essa sao permitido essa max em por exemplo 1 hora, ou seja sao permitido 100 request por hora
  windowMs: 60 * 15 * 1000,
  //message é a mensagem que sera enviada quando o limit de request for atingindo
  message: "Too many requests from this IP, please try again in 15 minutes!",
});

//limit requests per id address
app.use("/api", limiter);

//protect against noSql injection
app.use(mongoSanitize());

app.use("/", viewRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/users", userRouter);

app.use(errorControler);

module.exports = app;
