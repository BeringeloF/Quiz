import axios from "axios";

export const deleteQuiz = async (id, csrfToken) => {
  try {
    const res = await axios({
      method: "DELETE",
      url: "/api/v1/quiz/" + id,
      data: {
        csrfToken,
      },
    });

    location.assign(window.location.href);
  } catch (err) {
    console.log(err);
  }
};
