import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — CAPTURA DE PANTALLA

⚡ Genera una captura de pantalla de cualquier página web.

📌 Uso: .screenshot <url>
📌 Ejemplo: .screenshot https://github.com/dvwilker
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const api = `https://api.apiflash.com/v1/urltoimage?url=${encodeURIComponent(text)}&width=1200&height=800`
    
    await conn.sendMessage(m.chat, {
      image: { url: api },
      caption: `
🐉 GOHAN BEAST — CAPTURA DE PANTALLA

🔗 URL: ${text}
✅ Captura generada exitosamente

⚡ *Gohan Beast - Poder Máximo Activado*
      `.trim()
    }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al generar la captura.', m)
    await m.react('❌')
  }
}

handler.command = ['screenshot', 'captura', 'ss']
handler.tags = ['tools']
handler.help = ['screenshot <url>']

export default handler