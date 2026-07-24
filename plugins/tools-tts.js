import gtts from 'node-gtts'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — TEXTO A VOZ

⚡ Convierte texto a audio en español.

📌 Uso: .tts <texto>
📌 Ejemplo: .tts Hola guerrero, el poder te acompaña
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const gttsInstance = gtts('es')
    const audioPath = './tmp/tts.mp3'
    
    gttsInstance.save(audioPath, text, () => {
      conn.sendMessage(m.chat, {
        audio: { url: audioPath },
        mimetype: 'audio/mpeg',
        fileName: 'tts.mp3'
      }, { quoted: m })
      fs.unlinkSync(audioPath)
    })
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al generar el audio.', m)
    await m.react('❌')
  }
}

handler.command = ['tts', 'voz', 'textoavoz']
handler.tags = ['tools']
handler.help = ['tts <texto>']

export default handler