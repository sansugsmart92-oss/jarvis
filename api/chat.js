module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {

    const { message, memories } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Mensagem vazia"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {

      console.error("GEMINI_API_KEY não encontrada.");

      return res.status(500).json({
        error: "GEMINI_API_KEY não está configurada na Vercel."
      });

    }

    const prompt = `
Você é JARVIS, um assistente pessoal inteligente.

Responda sempre em português do Brasil.

Seja natural, útil e objetivo.

Memórias do usuário:
${memories || "Nenhuma memória registrada."}

Mensagem do usuário:
${message}
`;

    console.log("Enviando pergunta ao Gemini...");

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

    console.log(
      "Status Gemini:",
      response.status
    );

    console.log(
      "Resposta Gemini:",
      JSON.stringify(data)
    );

    if (!response.ok) {

      return res.status(500).json({

        error:
          data?.error?.message ||
          "O Gemini recusou a solicitação.",

        status:
          response.status,

        detalhes:
          data?.error || null

      });

    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {

      return res.status(500).json({

        error:
          "O Gemini respondeu, mas não enviou texto.",

        detalhes: data

      });

    }

    return res.status(200).json({

      reply: reply

    });

  } catch (error) {

    console.error(
      "ERRO INTERNO:",
      error
    );

    return res.status(500).json({

      error:
        error?.message ||
        "Erro interno no cérebro do JARVIS."

    });

  }

};
