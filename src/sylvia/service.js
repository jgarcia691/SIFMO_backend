/**
 * Servicio de Inteligencia Artificial Sylvia (100% Conversacional con Lenguaje Natural en Google Gemini)
 */

async function processSylviaChat(userMessage, conversationHistory = [], userData = null, draftData = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu_api_key')) {
    return {
      success: false,
      reply: '⚠️ Error de configuración: La clave de API de Gemini (GEMINI_API_KEY) no está configurada en el servidor.',
      intent: 'ERROR',
      draftData: draftData || null,
      createIncident: false,
      lookupTicketId: null,
      lookupFmo: null
    };
  }

  try {
    const systemInstruction = `
Eres Sylvia, la asistente de Inteligencia Artificial de Soporte Técnico SIFMO (CVG Ferrominera Orinoco).
Tu interacción con el usuario es 100% EN LENGUAJE NATURAL. No uses ni menciones botones.
Responde de forma DIRECTA, CONCISA, AMABLE y SIN TEXTO INNECESARIO (máximo 1 o 2 líneas por respuesta).

CONTEXTO ACTUAL DEL USUARIO:
- Nombre: ${userData?.nombre || 'Trabajador SIFMO'}
- Ficha: ${userData?.ficha || 'N/A'}
- Borrador actual en memoria (draftData): ${JSON.stringify(draftData || {})}

1. REPORTE Y CREACIÓN DE INCIDENTES:
   - Datos obligatorios:
     a) FMO: Número identificador del equipo (ej: 1045, 8820). No valides contra la base de datos, pídelo al usuario.
     b) Tipo de equipo: "Estación de Trabajo" (PC, CPU, Laptop) o "Periférico" (monitor, mouse, teclado, impresora, etc.).
     c) Falla: Breve descripción del problema técnico.
   - Pide en lenguaje natural los datos que falten.
   - Si el usuario te envía varios o todos los datos en un solo mensaje (ej: "mi monitor no prende FMO 1234"), extrae todos los datos de inmediato en el JSON.
   - Cuando tengas los 3 datos requeridos (FMO, tipo de equipo y falla):
     * Asigna "readyToConfirm": true en "draftData".
     * En "reply", di brevemente: "He preparado el reporte con estos datos. ¿Confirmas la creación del ticket o deseas cambiar algo?"
   - Si el borrador ya tiene "readyToConfirm": true y el usuario responde afirmativamente (ej: "sí", "confirmo", "de acuerdo", "créalo", "procede", "está bien", "dale", "correcto"):
     * Coloca "intent": "CREATE_INCIDENT", "createIncident": true y en "reply": "Perfecto, procedo a registrar tu incidente en el sistema."
   - Si el usuario pide cambiar algún dato (ej: "cambia el FMO a 9900", "es un periférico", "la falla es que la pantalla parpadea"):
     * Modifica el campo en "draftData", mantén "readyToConfirm": true y responde: "Datos actualizados. ¿Deseas confirmar la creación del ticket?"

2. CONSULTA DE ESTATUS DE INCIDENTES:
   - Si el usuario quiere consultar el estado de un ticket por número de ID (ej: "cómo va el ticket 105", "#105", "estatus del 105", "ver ticket 40"):
     * Coloca "intent": "CHECK_TICKET_STATUS", "lookupTicketId": "105", "lookupFmo": null.
   - Si el usuario quiere consultar el estado de un equipo por su FMO (ej: "estado del FMO 1234", "cómo va el fmo 5020", "estatus del equipo FMO 8820", "consultar FMO 9901"):
     * Coloca "intent": "CHECK_TICKET_STATUS", "lookupTicketId": null, "lookupFmo": "1234".
   - Si el usuario pide consultar pero no dio ID ni FMO:
     * Pídele en lenguaje natural que te indique el número de Ticket (#ID) o el FMO del equipo.

3. REGLAS DE ESTILO:
   - Sé directa, concisa y profesional. Sin introducciones largas ni rodeos.

FORMATO OBLIGATORIO DE SALIDA (ÚNICAMENTE UN OBJETO JSON VÁLIDO):
{
  "reply": "Texto conciso en lenguaje natural.",
  "intent": "GREETING" | "COLLECTING_INFO" | "READY_TO_CONFIRM" | "CREATE_INCIDENT" | "CHECK_TICKET_STATUS" | "GENERAL_HELP",
  "draftData": {
    "fmo": "string o null",
    "tipo_equipo": "estacion de trabajo" | "periferico" | null,
    "tipo": "reparacion de estacion de trabajo" | "reparacion de periferico" | null,
    "falla": "string o null",
    "observacion": "string o null",
    "readyToConfirm": true | false
  },
  "createIncident": true | false,
  "lookupTicketId": "string o null",
  "lookupFmo": "string o null"
}
`;

    // Formatear historial con alternancia estricta de turnos Gemini (user <-> model)
    const contents = formatGeminiContents(conversationHistory, userMessage);

    const modelsToTry = [
      configuredModel,
      'gemini-3.5-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite'
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

    let rawText = null;
    let lastError = null;

    for (const model of modelsToTry) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`[Gemini AI] Invocando modelo: ${model}`);

      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) break;
        } else {
          const errText = await res.text();
          console.warn(`[Gemini AI] Modelo ${model} respondió ${res.status}: ${errText.slice(0, 180)}`);
          lastError = `Estatus ${res.status}: ${errText.slice(0, 100)}`;
        }
      } catch (err) {
        console.warn(`[Gemini AI] Error con modelo ${model}:`, err.message);
        lastError = err.message;
      }
    }

    if (!rawText) {
      return {
        success: false,
        reply: `❌ No se pudo conectar con la IA de Gemini (${lastError || 'Servicio no disponible'}). Por favor intenta de nuevo en unos momentos.`,
        intent: 'ERROR',
        draftData: draftData || null,
        createIncident: false,
        lookupTicketId: null,
        lookupFmo: null
      };
    }

    let cleanJsonStr = rawText.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
    let parsed = null;

    try {
      parsed = JSON.parse(cleanJsonStr);
    } catch (e) {
      const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (matchErr) {
          console.warn('[Gemini AI] Error parseando bloque JSON:', matchErr.message);
        }
      }
    }

    if (!parsed) {
      return {
        success: true,
        reply: rawText.replace(/```/g, '').trim(),
        intent: 'GENERAL_HELP',
        draftData: draftData || null,
        createIncident: false,
        lookupTicketId: null,
        lookupFmo: null
      };
    }

    const consolidatedDraft = {
      ...(draftData || {}),
      ...(parsed.draftData || {})
    };

    if (consolidatedDraft.fmo && consolidatedDraft.tipo_equipo && consolidatedDraft.falla) {
      consolidatedDraft.readyToConfirm = true;
      consolidatedDraft.tipo = consolidatedDraft.tipo_equipo === 'estacion de trabajo'
        ? 'reparacion de estacion de trabajo'
        : 'reparacion de periferico';
    }

    return {
      success: true,
      reply: parsed.reply || 'Información procesada por Sylvia AI.',
      intent: parsed.intent || (parsed.createIncident ? 'CREATE_INCIDENT' : (consolidatedDraft.readyToConfirm ? 'READY_TO_CONFIRM' : 'COLLECTING_INFO')),
      draftData: consolidatedDraft,
      createIncident: Boolean(parsed.createIncident || parsed.intent === 'CREATE_INCIDENT'),
      lookupTicketId: parsed.lookupTicketId || null,
      lookupFmo: parsed.lookupFmo || null
    };

  } catch (err) {
    console.error('Error invocando Gemini API para Sylvia:', err);
    return {
      success: false,
      reply: '❌ Ocurrió un error al procesar tu mensaje con la IA. Por favor intenta de nuevo.',
      intent: 'ERROR',
      draftData: draftData || null,
      createIncident: false,
      lookupTicketId: null,
      lookupFmo: null
    };
  }
}

/**
 * Formatear historial con turnos estrictos user -> model -> user para Gemini API
 */
function formatGeminiContents(history = [], currentMessage = '') {
  const turns = [];

  for (const msg of history) {
    if (!msg || !msg.text) continue;
    const role = (msg.sender === 'user' || msg.role === 'user') ? 'user' : 'model';
    const text = typeof msg.text === 'string' ? msg.text.trim() : JSON.stringify(msg.text);
    if (!text) continue;

    if (turns.length > 0 && turns[turns.length - 1].role === role) {
      turns[turns.length - 1].parts[0].text += `\n${text}`;
    } else {
      turns.push({ role, parts: [{ text }] });
    }
  }

  // Asegurar que el último turno sea el mensaje actual del usuario
  if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
    turns[turns.length - 1].parts[0].text += `\n${currentMessage.trim()}`;
  } else {
    turns.push({ role: 'user', parts: [{ text: currentMessage.trim() }] });
  }

  // Gemini API exige que el primer turno sea 'user'
  while (turns.length > 0 && turns[0].role !== 'user') {
    turns.shift();
  }

  if (turns.length === 0) {
    turns.push({ role: 'user', parts: [{ text: currentMessage.trim() }] });
  }

  return turns;
}

module.exports = { processSylviaChat };
