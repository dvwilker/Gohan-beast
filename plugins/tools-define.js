import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — DEFINICIÓN

⚡ Busca el significado de cualquier palabra.

📌 Uso: .define <palabra>
📌 Ejemplo: .define amor
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`)
    const data = res.data[0]
    
    const meanings = data.meanings.map(m => {
      const def = m.definitions[0].definition
      return `📌 *${m.partOfSpeech}*: ${def}`
    }).join('\n')

    await conn.reply(m.chat, `
🐉 GOHAN BEAST — DEFINICIÓN

📖 *Palabra:* ${data.word}
${meanings}

📌 *Ejemplo:* ${data.meanings[0].definitions[0].example || 'N/A'}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ No se encontró la palabra.', m)
    await m.react('❌')
  }
}

handler.command = ['define', 'definicion', 'significado']
handler.tags = ['tools']
handler.help = ['define <palabra>']

export default handler