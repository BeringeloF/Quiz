import request from "supertest";
import app from "./app.js"; // Caminho para o seu arquivo principal do Express
import { expect } from "chai";
import { describe, it, before, after } from "mocha";
import dotenv from "dotenv";
import mongoose from "mongoose";

//Test Create User And Quiz

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));
let server;

describe("Testes de Integração - API Quiz e Usuarios", () => {
  let userId;

  before((done) => {
    server = app.listen(3000, () => {
      console.log("Test server running on port 3000");
      done();
    });
  });

  after((done) => {
    mongoose.connection.close(() => {
      server.close(done);
    });
    done();
  });

  it("Deve criar um novo usuário", (done) => {
    request(server)
      .post("/api/v1/users/register")
      .send({
        name: "Alice",
        email: "newUser3@example.com",
        password: "pass1234",
        passwordConfirm: "pass1234",
      })
      .expect(201) // Código de status HTTP esperado
      .then((response) => {
        expect(response.body.data.user).to.have.property("_id");
        expect(response.body.data.user.name).to.equal("Alice");
        expect(response.body.data.user.email).to.equal("newUser3@example.com");
        userId = response.body.data.user._id; // Salvar o ID do usuário para o próximo teste
        console.log(userId);
        done();
      })
      .catch((err) => done(err));
  });

  it("Deve criar um quiz com author sendo o usuário recém-criado", (done) => {
    request(server)
      .post(`/api/v1/quiz`)
      .send({
        name: "General Test 3",
        description: "A short general knowledge test.",
        imageCover: "test-quiz-cover.jpg",
        author: {
          authorName: "John Doe",
          user: userId,
        },
        difficulty: "medium",
        category: "General Knowledge",
        questions: [
          {
            question: "What is the capital of France?",
            answers: ["Berlin", "Madrid", "Paris", "Lisbon"],
            correctAnswer: 2,
          },
          {
            question: "Which planet is known as the Red Planet?",
            answers: ["Earth", "Mars", "Jupiter", "Saturn"],
            correctAnswer: 1,
          },
          {
            question: "Who wrote 'To Kill a Mockingbird'?",
            answers: [
              "Harper Lee",
              "Mark Twain",
              "Ernest Hemingway",
              "F. Scott Fitzgerald",
            ],
            correctAnswer: 0,
          },
          {
            question: "What is the largest ocean on Earth?",
            answers: [
              "Atlantic Ocean",
              "Indian Ocean",
              "Arctic Ocean",
              "Pacific Ocean",
            ],
            correctAnswer: 3,
          },
          {
            question: "What is the chemical symbol for water?",
            answers: ["H2O", "O2", "CO2", "NaCl"],
            correctAnswer: 0,
          },
        ],
      })
      .expect(201)
      .then((response) => {
        expect(response.body.data.quiz).to.have.property("_id");
        expect(response.body.data.quiz.name).to.equal("General Test 3");
        expect(response.body.data.quiz.description).to.equal(
          "A short general knowledge test."
        );
        expect(response.body.data.quiz.author.user).to.equal(userId);
        done();
      })
      .catch((err) => done(err));
  });
});
