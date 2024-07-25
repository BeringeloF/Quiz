const mongoose = require("mongoose");
const slugify = require("slugify");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxLength: [250, "A question must have less or equal then 250 caracters"],
  },
  answers: {
    type: [String],
    required: true,
    trim: true,
    maxLength: [130, "A answer must have less or equal then 130 caracters"],

    validate: [
      arrayLimit,
      "{PATH} deve ter no mínimo 3 e no máximo 5 respostas",
    ],
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0 && value < this.answers.length;
      },
      message: "Índice de resposta correta inválido",
    },
  },
});

function arrayLimit(val) {
  return val.length >= 3 && val.length <= 5;
}

const quizSchema = new Schema({
  name: {
    type: String,
    required: [true, "a quiz must have a name"],
    trim: true,
    maxLength: [50, "A quiz name must have less or equal then 50 caracters"],
    minLength: [8, "A quiz name must have more or equal then 8 caracters"],
  },
  description: {
    type: String,
    required: [true, "a quiz must have a description"],
    trim: true,
    maxLength: [
      150,
      "A description must have less or equal then 150 caracters",
    ],
  },
  views: {
    type: Number,
    default: 0,
  },
  imageCover: {
    type: String,
    default: "default.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  author: {
    type: {
      authorName: String,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "QuizUser",
      },
    },
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: [true, "a quiz must have a difficulty"],
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxLength: [20, "A tour name must have less or equal then 20 caracters"],
  },
  questions: {
    type: [questionSchema],
    default: undefined,
  },
  slug: {
    type: String,
    unique: true,
  },
});

quizSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.slug = `${slugify(this.name, { lower: true })}-${Date.now()}`;
  }

  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);

module.exports = Quiz;
