export default async function handler(req, res) {
  const { text } = req.query;
  res.status(200).json({ message: `Aqui viria a resposta do Grok sobre: ${text}` });
}
