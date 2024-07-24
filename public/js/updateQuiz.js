import axios from "axios";

export const updateQuiz = async (data, id) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/quiz/" + id,
      data,
    });
    console.log(res);
    location.assign("/");
  } catch (err) {
    console.log(err);
  }
};
