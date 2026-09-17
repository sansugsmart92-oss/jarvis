module.exports = async function handler(req, res) {

  try {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não encontrada na Vercel."
      });
    }

    // TESTE DIRETO PELO NAVEGADOR
    if (req.method === "GET") {

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Responda apenas: OLÁ JARVIS"
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      return res.status(response.status).json({
        teste: true,
        statusGemini: response.status,
        resposta: data
      });
    }

    // USO NORMAL DO JARVIS
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método não permitido"
      });
    }

    const { message, memories } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Mensagem vazia"
      });
    }

    const prompt = `
Você é JARVIS, um assistente pessoal inteligente.

Responda sempre em português do Brasil.
Seja natural, útil e objetivo.

Memórias:
${memories || "Nenhuma memória registrada."}

Usuário:
${message}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erro do Gemini",
        detalhes: data?.error || null
      });

    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    return res.status(200).json({
      reply: reply || "O Gemini não retornou texto."
    });

  } catch (error) {

    return res.status(500).json({
      error: error?.message || "Erro interno"
    });

  }

};
