let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — BOLA MÁGICA 8

⚡ Pregunta algo y la bola mágica te responderá.

📌 Uso: .8ball <pregunta>
📌 Ejemplo: .8ball ¿Hoy será un buen día?
    `.trim(), m)
  }

  const responses = [
    "✅ Sí, definitivamente.",
    "✅ Sí.",
    "❓ Probablemente sí.",
    "🤔 No estoy seguro, intenta de nuevo.",
    "❌ Probablemente no.",
    "❌ No, para nada.",
    "❓ Pregunta más tarde.",
    "✅ Sin duda alguna.",
    "❌ No cuentes con ello.",
    "✅ Como lo deseas.",
    "❌ Muy dudoso.",
    "✅ Claro que sí guerrero.",
    "❌ Mejor no te digo.",
    "✅ El poder del dragón te acompaña.",
    "❌ El destino dice que no.",
    "🤔 La energía está confusa, vuelve a preguntar."
  ]

  const answer = responses[Math.floor(Math.random() * responses.length)]
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — BOLA MÁGICA 8

🎱 Pregunta: ${text}
✨ Respuesta: ${answer}
    `.trim(), m)
  await m.react('🎱')
}

handler.command = ['8ball', 'bola8', 'preguntar']
handler.tags = ['fun']
handler.help = ['8ball <pregunta>']

export default handler