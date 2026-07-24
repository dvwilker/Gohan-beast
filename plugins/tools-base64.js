let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — BASE64

⚡ Codifica o decodifica texto en Base64.

📌 Uso:
.base64 <texto> - Codificar
.unbase64 <código> - Decodificar

📌 Ejemplo:
.base64 Hola guerrero
.unbase64 SG9sYSBndWVycmVybw==
    `.trim(), m)
  }

  try {
    let result
    if (command === 'base64') {
      result = Buffer.from(text).toString('base64')
      await conn.reply(m.chat, `
🐉 GOHAN BEAST — BASE64

📌 Texto original: ${text}
✅ Codificado: ${result}
      `.trim(), m)
    } else {
      result = Buffer.from(text, 'base64').toString('utf-8')
      await conn.reply(m.chat, `
🐉 GOHAN BEAST — BASE64

📌 Código: ${text}
✅ Decodificado: ${result}
      `.trim(), m)
    }
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al procesar el texto.', m)
    await m.react('❌')
  }
}

handler.command = ['base64', 'unbase64']
handler.tags = ['tools']
handler.help = ['base64 <texto>', 'unbase64 <código>']

export default handler