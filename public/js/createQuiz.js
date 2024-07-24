/* eslint-disable */
import axios from "axios";

export const createQuiz = async (data) => {
  try {
    let res = await axios({
      method: "POST", // Método da requisição
      url: "/api/v1/quiz",
      data,
    });

    console.log(res);
    if (res.status === "success") {
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
  }
};
