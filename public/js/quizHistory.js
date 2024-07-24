export const saveOnHistory = async (data, csrfToken) => {
  try {
    await fetch("/api/v1/users/saveQuizHistory", {
      method: "POST", // Método da requisição
      headers: {
        "Content-Type": "application/json", // Tipo de conteúdo enviado
      },
      body: JSON.stringify({ data, csrfToken }),
    });
  } catch (err) {
    console.log(err);
  }
};
