const { connectDB } = require('../../config/database');

/**
 * Servicio de Inteligencia Artificial Sylvia con integración exclusiva a Gemini 3.5 Flash Lite
 */
async function processSylviaChat(userMessage, conversationHistory = [], userData = null) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'tu_api_key_aqui') {
    return {
      success: true,
      fallback: true,
      reply: null,
      message: 'GEMINI_API_KEY no configurada. Usando motor guionisado.'
    };
  }

  try {
    const db = await connectDB();
    
    // Obtener contexto de equipos del usuario
    let userEquipos = [];
    let userIncidents = [];
    if (userData?.ficha) {
      userEquipos = await db.all('SELECT fmo, tipo, nombre, serial, so FROM Equipo WHERE propietario_ficha = ?', [userData.ficha]);
      userIncidents = await db.all('SELECT id, tipo, status, fecha FROM Incidente WHERE cliente = ? ORDER BY id DESC LIMIT 5', [userData.ficha]);
    }

    // Contexto del sistema para Gemini
    const systemInstruction = `
Eres Sylvia, la asistenta virtual inteligente de Soporte Técnico SIFMO (Sistema de Gestión de Incidencias de Ferrominera Orinoco).
Tu objetivo es ayudar a los trabajadores de la empresa a solucionar dudas de soporte IT, guiar el reporte de incidentes y consultar el estatus de sus solicitudes.

CONTEXTO DEL USUARIO ACTUAL:
- Nombre: ${userData?.nombre || 'Usuario SIFMO'}
- Ficha: ${userData?.ficha || 'N/A'}
- Equipos registrados a su nombre: ${JSON.stringify(userEquipos)}
- Tickets / Incidentes recientes: ${JSON.stringify(userIncidents)}

INSTRUCCIONES DE RESPUESTA:
Debes responder SIEMPRE únicamente en formato JSON válido con la siguiente estructura:
{
  "reply": "Tu respuesta conversacional amable, profesional y concisa en español.",
  "intent": "GREETING" | "GENERAL_HELP" | "CREATE_TICKET_DRAFT" | "CHECK_TICKET_STATUS",
  "draftData": {
    "tipo": "reparacion de estacion de trabajo" | "reparacion de periferico" | "solicitud",
    "cpu_fmo": "número FMO si aplica",
    "fmo": "número FMO de periférico si aplica",
    "tipo_falla": "descripción breve de la falla si aplica",
    "respaldo": true | false,
    "observacion": "detalles adicionales",
    "tipo_solicitud": "tipo si es solicitud",
    "descripcion": "descripción de la solicitud"
  },
  "lookupTicketId": "ID del ticket si el usuario pregunta por el estado de un número específico o null",
  "suggestedButtons": [
    { "label": "Texto del botón", "action": "NombreAccion", "value": "ValorOpcional" }
  ]
}

REGLAS:
1. Si el usuario describe un problema técnico que requiere intervención (ej: "mi pantalla no prende", "la impresora no funciona"), ofrece la solución básica y pon intent = "CREATE_TICKET_DRAFT" con draftData pre-llenado para sugerirle abrir un reporte.
2. Si pregunta por el estado de un ticket (ej: "¿Cómo va mi ticket #102?"), pon intent = "CHECK_TICKET_STATUS" y extrae el ID en "lookupTicketId".
3. Responde únicamente con el objeto JSON, sin texto extra fuera de las llaves {}.
`;

    // Formatear historial reciente
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }]
      },
      ...conversationHistory.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    // Modelo primario preferido: gemini-3.6-flash (con respaldos ante 503 por alta demanda temporal)
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const modelsToTry = [primaryModel, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'].filter((v, i, a) => a.indexOf(v) === i);

    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      console.log(`[Gemini API] Probando modelo: ${modelName}`);

      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3
            }
          })
        });

        if (res.ok) {
          console.log(`[Gemini API] Solicitud exitosa con modelo: ${modelName}`);
          response = res;
          break;
        } else {
          const errText = await res.text();
          console.warn(`[Gemini API] Modelo ${modelName} retornó estatus ${res.status}: ${errText.slice(0, 180)}`);
          lastError = `Estatus ${res.status} en ${modelName}`;
        }
      } catch (err) {
        console.warn(`[Gemini API] Error al conectar con ${modelName}:`, err.message);
        lastError = err.message;
      }
    }

    if (!response) {
      console.warn(`[Gemini API] Todos los modelos de Gemini fallaron. Último error: ${lastError}. Usando modo guionisado.`);
      return { success: true, fallback: true, error: lastError };
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return { success: true, fallback: true };
    }

    // Parseo robusto de JSON
    let parsed = null;
    let cleanJsonStr = rawText.trim();
    cleanJsonStr = cleanJsonStr.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    try {
      parsed = JSON.parse(cleanJsonStr);
    } catch (e) {
      // Intentar extraer bloque JSON { ... } usando regex si vino texto envolvente
      const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (matchErr) {
          console.warn('[Gemini API] No se pudo parsear el bloque JSON con regex:', matchErr.message);
        }
      }
    }

    if (!parsed) {
      // Si la respuesta fue texto plano en lugar de JSON, mostrar la respuesta del modelo sin fallar
      console.log('[Gemini API] Modelo retornó texto plano. Ajustando respuesta suave.');
      return {
        success: true,
        fallback: false,
        reply: rawText.replace(/```/g, '').trim(),
        intent: 'GENERAL_HELP',
        suggestedButtons: [
          { label: '📝 Crear Reporte', action: 'GOTO_REPORT_SELECT' },
          { label: '🔍 Consultar Ticket', action: 'GOTO_STATUS_MENU' },
          { label: '🏠 Menú Principal', action: 'GOTO_MAIN_MENU' }
        ]
      };
    }

    return {
      success: true,
      fallback: false,
      reply: parsed.reply || 'Hola, ¿en qué te puedo colaborar?',
      intent: parsed.intent || 'GENERAL_HELP',
      draftData: parsed.draftData || null,
      lookupTicketId: parsed.lookupTicketId || null,
      suggestedButtons: parsed.suggestedButtons || []
    };

  } catch (err) {
    console.error('Error invocando Gemini LLM para Sylvia:', err);
    return { success: true, fallback: true, error: err.message };
  }
}

module.exports = { processSylviaChat };
