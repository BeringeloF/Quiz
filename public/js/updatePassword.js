import axios from "axios";

export const updatePassword = async (data, csrfToken) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/updatePassword`,
      data: { data, csrfToken },
    });
    console.log(res);
    location.assign("/");
  } catch (err) {
    console.log(err);
  }
};
