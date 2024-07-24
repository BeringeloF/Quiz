/* eslint-disable */

export const login = async (data) => {
  try {
    let res = await fetch("/api/v1/users/login", {
      method: "POST", // Método da requisição
      headers: {
        "Content-Type": "application/json", // Tipo de conteúdo enviado
      },
      body: JSON.stringify(data),
    });
    res = await res.json();
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
