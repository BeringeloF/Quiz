import axios from "axios";

export const updateMe = async (data) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/updateMe`,
      data,
    });
    console.log(res);
    location.assign("/userDetails");
  } catch (err) {
    console.log(err);
  }
};
