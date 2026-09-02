const sylviaService = require('./service');

async function handleSylviaChat(req, res) {
  try {
    const { message, conversationHistory, user } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje del usuario es obligatorio' });
    }

    const result = await sylviaService.processSylviaChat(message, conversationHistory || [], user || null);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en controlador Sylvia Chat:', error);
    res.status(500).json({ error: error.message || 'Error procesando solicitud con Sylvia' });
  }
}

module.exports = { handleSylviaChat };
