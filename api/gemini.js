export default async function handler(req, res) {
  const { text } = req.query;

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Resuma este texto como um corte de vídeo: ${text}` }] }]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
