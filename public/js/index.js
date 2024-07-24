/* eslint-disable */

import { updateQuiz } from "./updateQuiz.js";
import { createQuiz } from "./createQuiz.js";
import { increseViewCount } from "./increseView.js";
import { login } from "./login.js";
import { saveOnHistory } from "./quizHistory.js";
import { singUp } from "./singUp.js";
import { deleteQuiz } from "./deleteQuiz.js";
import { updatePassword } from "./updatePassword.js";
import { updateMe } from "./updateMe.js";

const loginForm = document.querySelector(".login-form");
const singupForm = document.querySelector(".signup-form");
const main = document.querySelector("main");
const addQuestionBtn = document.querySelector("#add-question-btn");
const questionContainer = document.querySelector("#questions-container");
const createQuizForm = document.querySelector(".create-quiz-form");
const profileContainer = document.querySelector(".profile-container");
const dropdownMenu = document.getElementById("dropdown-menu");
const saveQuizBtn = document.querySelector(".save-quiz");
const deleteQuizContainer = document.querySelector(".manage-quizzes");
const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector(".search-btn");
const changePasswordForm = document.querySelector(".change-password-form");

let correctAnswers = 0;
main.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("quiz-option")) return;
  const quizOption = e.target;
  const quizContainer = quizOption.closest(".quiz-question-container");

  if (quizOption.dataset.answer === quizContainer.dataset.correct) {
    correctAnswers++;
  }
  const index = quizContainer.dataset.index;
  console.log(index);
  const nextQuestion = document.querySelector(`[data-index="${+index + 1}"]`);

  if (!nextQuestion) {
    const completionCard = document.querySelector(".completion-card");
    completionCard.querySelector(
      "p"
    ).textContent = `Você completou o quiz. Acertando ${correctAnswers} perguntas de ${
      +index + 1
    }`;
    completionCard.classList.remove("hidden");
    quizContainer.classList.add("hidden");
    const quizId = main.dataset.quizid;
    const token = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");

    saveOnHistory(
      { quizId, correctAnswers, totalQuestions: +index + 1 },
      token
    );
    increseViewCount(quizId, token);

    return;
  }

  quizContainer.classList.add("hidden");
  nextQuestion.classList.remove("hidden");
});

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    console.log(email, password);
    await login({ email, password });
  });
}

if (singupForm) {
  singupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const name = document.querySelector("#name").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#confirm-password").value;
    console.log(name, email);
    await singUp({ email, name, password, passwordConfirm });
  });
}

if (addQuestionBtn) {
  addQuestionBtn.addEventListener("click", (e) => {
    const lastQuestionIndex =
      +questionContainer.lastElementChild.dataset.question;
    const markup = `
    <div class="question-group" data-question="${lastQuestionIndex + 1}">
             <span class="exclude">X</span>
                    <h3>Question ${lastQuestionIndex + 2}</h3>
                    <div class="form-group">
                        <label for="question-${
                          lastQuestionIndex + 2
                        }">Question</label>
                        <input type="text" id="question-${
                          lastQuestionIndex + 2
                        }" name="questions[${
      lastQuestionIndex + 1
    }][question]" required>
                    </div>
                    <div class="answers-group">
                        <label>Answers</label>
                        <div class="answer">
                            <input type="text" name="questions[${
                              lastQuestionIndex + 1
                            }][answers][]" required>
                            <input type="radio" name="questions[${
                              lastQuestionIndex + 1
                            }][correct_answer]" value="0" required>
                        </div>
                        <div class="answer">
                            <input type="text" name="questions[${
                              lastQuestionIndex + 1
                            }][answers][]" required>
                            <input type="radio" name="questions[${
                              lastQuestionIndex + 1
                            }][correct_answer]" value="1" required>
                        </div>
                        <div class="answer">
                            <input type="text" name="questions[${
                              lastQuestionIndex + 1
                            }][answers][]" required>
                            <input type="radio" name="questions[${
                              lastQuestionIndex + 1
                            }][correct_answer]" value="2" required>
                        </div>
                        <div class="answer">
                            <input type="text" name="questions[${
                              lastQuestionIndex + 1
                            }][answers][]" required>
                            <input type="radio" name="questions[${
                              lastQuestionIndex + 1
                            }][correct_answer]" value="3" required>
                        </div>
                    </div>
    </div>
    `;

    questionContainer.insertAdjacentHTML("beforeend", markup);
  });

  questionContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("exclude")) return;

    e.target.closest(".question-group").remove();
  });
}

if (createQuizForm) {
  createQuizForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(createQuizForm);
    const token = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute("content");
    const questions = [...document.querySelectorAll(".question-group")].map(
      (el, i) => {
        return {
          question:
            el.querySelector(`#question-${i + 1}`).value || "psefjsushdfoufs",
          answers: [
            ...el.querySelectorAll(`[name="questions[${i}][answers][]"]`),
          ].map((ans) => ans.value || "sfjdofdj"),
          correctAnswer:
            +el.querySelector(
              `input[name="questions[${i}][correct_answer]"]:checked`
            )?.value || 1,
        };
      }
    );

    console.log(questions);

    formData.append("questions", JSON.stringify(questions));

    formData.append("csrfToken", token);

    console.log(token, "token aqui");

    await createQuiz(formData);
  });
}

profileContainer?.addEventListener("click", () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (event) => {
  if (!profileContainer) return;
  if (!profileContainer.contains(event.target)) {
    dropdownMenu.style.display = "none";
  }
});

saveQuizBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  const formData = new FormData();

  const id = document.querySelector(".create-quiz-container").dataset.id;
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  const questions = [...document.querySelectorAll(".question-group")].map(
    (el, i) => {
      return {
        question: el.querySelector(`#question-${i + 1}`).value,
        answers: [
          ...el.querySelectorAll(`[name="questions[${i}][answers][]"]`),
        ].map((ans) => ans.value),
        correctAnswer: +el.querySelector(
          `input[name="questions[${i}][correct_answer]"]:checked`
        ).value,
      };
    }
  );
  formData.append("name", document.getElementById("name").value);
  const difficultySelect = document.getElementById("difficulty");
  formData.append("difficulty", difficultySelect.value);

  formData.append("category", document.getElementById("category").value);

  formData.append("description", document.getElementById("description").value);

  const imageInput = document.getElementById("image");
  if (imageInput.files.length > 0) {
    formData.append("imageCover", imageInput.files[0]);
  }
  formData.append("questions", JSON.stringify(questions));
  formData.append("csrfToken", token);
  updateQuiz(formData, id);
});

deleteQuizContainer?.addEventListener("click", (e) => {
  if (!e.target.classList.contains("delete-button")) return;

  const popUp = document.querySelector(".confirmation-popup");
  popUp.style.display = "flex";

  const id = e.target.closest(".quiz-mini-card").dataset.id;
  const confirmBtn = document.querySelector(".confirm-button");
  const cancelBtn = document.querySelector(".cancel-button");
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  confirmBtn.addEventListener("click", () => {
    deleteQuiz(id, token);
  });

  cancelBtn.addEventListener("click", () => {
    popUp.style.display = "none";
  });
});

searchBtn.addEventListener("click", () => {
  const str = new Set(searchInput.value);
  console.log(str);
  if (str.size < 2) return;

  location.assign(`/?search=${searchInput.value}`);
});

changePasswordForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const currentPassword = document.querySelector("#current-password").value;
  const password = document.querySelector("#password").value;
  const passwordConfirm = document.querySelector("#confirm-password").value;
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  console.log("esta indo...");

  updatePassword({ currentPassword, password, passwordConfirm }, csrfToken);
});

document.querySelector(".new-photo-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  const imageInput = document.getElementById("image");
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  if (imageInput.files.length > 0) {
    const formData = new FormData();
    formData.append("photo", imageInput.files[0]);
    formData.append("csrfToken", token);
    updateMe(formData);
  }
});
