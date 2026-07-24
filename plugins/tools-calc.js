let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — CALCULADORA

⚡ Resuelve operaciones matemáticas.

📌 Uso: .calc <operación>
📌 Ejemplo: .calc 2+2
📌 Ejemplo: .calc (10*5)/2
    `.trim(), m)
  }

  try {
    const result = Function('"use strict"; return (' + text + ')')()
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — CALCULADORA

📌 Operación: ${text}
✅ Resultado: ${result}
    `.trim(), m)
    await m.react('🧮')
  } catch (e) {
    await conn.reply(m.chat, '❌ Operación inválida. Asegúrate de usar números y operadores correctos.', m)
    await m.react('❌')
  }
}

handler.command = ['calc', 'calculadora', 'math']
handler.tags = ['tools']
handler.help = ['calc <operación>']

export default handler