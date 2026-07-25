let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — RECORDATORIO

⚡ Programa un recordatorio.

📌 Uso: .remind <minutos> <mensaje>
📌 Ejemplo: .remind 5 Tomar agua
    `.trim(), m)
  }

  const parts = text.split(' ')
  const minutes = parseInt(parts[0])
  const message = parts.slice(1).join(' ')

  if (isNaN(minutes) || minutes <= 0) {
    return conn.reply(m.chat, '❌ Tiempo inválido. Usa: .remind 5 Tomar agua', m)
  }

  if (!message) {
    return conn.reply(m.chat, '❌ Escribe un mensaje para recordar.', m)
  }

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — RECORDATORIO PROGRAMADO

⏳ Te recordaré en ${minutes} minuto(s).

📌 *Mensaje:* ${message}

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('⏳')

  setTimeout(async () => {
    await conn.sendMessage(m.chat, `
🐉 GOHAN BEAST — RECORDATORIO

⏰ *¡Es hora de recordar!*

📌 ${message}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), { quoted: m })
  }, minutes * 60000)
}

handler.command = ['remind', 'recordar']
handler.tags = ['tools']
handler.help = ['remind <minutos> <mensaje>']

export default handler