const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Quiz = require("../models/quizModel");

dotenv.config({ path: "../config.env" });

let DB = process.env.DATABASE;
DB = DB.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
console.log(DB);

mongoose.connect(DB).then(() => console.log("db connected"));

// console.log(con.connections);
console.log("DB connection seccusful!");

const quizes = [];

const importData = async function () {
  try {
    //nos tambem podemos passar um array no create e ele ira criar um documento para cada elelento
    await Quiz.create(quizes);

    console.log("data succesfuly loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit(); //para parar a aplicaçao
};

const deleteData = async function () {
  try {
    //e como nos nao passamos nenhum parametro todos os documetos da collecao serao deletados
    await Quiz.deleteMany();

    console.log("data succesfuly deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit(); //para parar a aplicaçao
};

if (process.argv[2] === "--import") importData();
if (process.argv[2] === "--delete") deleteData();

console.log(process.argv);
