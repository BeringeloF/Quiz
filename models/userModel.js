const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const historySchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: "Quiz",
  },
  correctAnswers: Number,
  totalQuestions: Number,
  completedAt: Date,
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "an user must have a name"],
    trim: true,
    maxLength: [30, "A name must have less or equal then 30 caracters"],
    minLength: [3, "A name must have more or equal then 3 caracters"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "you need to confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "passwords do not match!",
    },
  },

  photo: {
    type: String,
    default: "author.jpg",
  },

  level: {
    type: Number,
    default: 0,
  },
  exp: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    defualt: Date.now(),
  },
  history: {
    type: [historySchema],
    default: undefined,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
});

userSchema.pre("save", async function (next) {
  //em todo documento nos temos acesso a uma propriedade chamada isModified() que diz se documeto foi modificado

  if (!this.isModified("password")) next();
  //é aqui onde é feito a criptografia da senha, nos usamo hash que aceita como primeiro parametro a string e como segundo
  //pode pode ser dizer o nivel da criptografia que é padra ser 10 quanto maior o numero melhor a segurança mais tambem
  //vai necessitar mais uso do cpu
  this.password = await bcrypt.hash(this.password, 12);

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "history.quiz",
    select: "name difficulty category author",
  });

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  //Aqui nos usamos menos 1000 ms pois, o servidor pode demorar um tempo para chegar ate esta parte, emtao para que o codigo funcione corrretamente
  //Nos tiramos um segundo para garantir
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //Primeiro checar se a senha foi mudada
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

    //retornar true se a data em que token foi criado é menor do que a data em que a senha foi modificada
    //e neste caso como o token foi emitido antes da senha ser modificada nos NAO iremos liberar o acesso
    //CASO RETORNE FALSE, NESTE CASO NOS IREMOS LEBERAR O ACESSO, ja que o token foi emitido depois da senha ser alterada
    return JWTTimestamp < changedTimestamp;
  }

  //Por padrao retorna false
  return false;
};

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.increseExpAndLevel = function (
  quizDifficulty,
  correctAnswers
) {
  if (quizDifficulty === "easy") {
    this.exp += 5 * correctAnswers;
  }

  if (quizDifficulty === "medium") {
    this.exp += 10 * correctAnswers;
  }

  if (quizDifficulty === "hard") {
    this.exp += 15 * correctAnswers;
  }

  if (Math.floor(this.exp / 100) > 0) this.level = Math.floor(this.exp / 100);
};

const QuizUser = new mongoose.model("QuizUser", userSchema);

module.exports = QuizUser;
