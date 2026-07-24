import axios from 'axios'

let handler = async (m, { conn }) => {
  try {
    await m.react('⏳')
    const res = await axios.get('https://meme-api.com/gimme')
    const meme = res.data

    await conn.sendMessage(m.chat, {
      image: { url: meme.url },
      caption: `
🐉 GOHAN BEAST — MEME

📌 *Título:* ${meme.title || 'Meme'}
👍 *Upvotes:* ${meme.ups || 'N/A'}
💬 *Comentarios:* ${meme.comments || 'N/A'}

⚡ *Gohan Beast - Poder Máximo Activado*
      `.trim()
    }, { quoted: m })
    await m.react('😂')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al obtener el meme.', m)
    await m.react('❌')
  }
}

handler.command = ['meme', 'memes']
handler.tags = ['fun']
handler.help = ['meme']

export default handler