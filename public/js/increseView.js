export const increseViewCount = async (id, csrfToken) => {
  try {
    await fetch("/api/v1/quiz/" + id, {
      method: "PATCH", // Método da requisição
      headers: {
        "Content-Type": "application/json", // Tipo de conteúdo enviado
      },
      body: JSON.stringify({ data: { views: 1 }, csrfToken }),
    });
  } catch (err) {
    console.log(err);
  }
};
