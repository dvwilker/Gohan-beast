import axios from 'axios'

let handler = async (m, { conn }) => {
  try {
    await m.react('⏳')
    const res = await axios.get('https://api.waifu.pics/sfw/waifu')
    const imageUrl = res.data.url

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `
🐉 GOHAN BEAST — WAIFU

🌸 Una waifu para ti guerrero

⚡ *Gohan Beast - Poder Máximo Activado*
      `.trim()
    }, { quoted: m })
    await m.react('🌸')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al obtener la waifu.', m)
    await m.react('❌')
  }
}

handler.command = ['waifu', 'waifuimg']
handler.tags = ['anime']
handler.help = ['waifu']

export default handler