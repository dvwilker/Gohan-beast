import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

⚡ Muestra información de cualquier país.

📌 Uso: .country <país>
📌 Ejemplo: .country Venezuela
📌 Ejemplo: .country Colombia
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    
    // cambie a muchas V1 vè v12 njdddddddd
    const res = await axios.get(`https://api.popcat.xyz/country?country=${encodeURIComponent(text)}`)
    const data = res.data

    if (!data || data.error) {
      return conn.reply(m.chat, '❌ País no encontrado. Verifica el nombre.', m)
    }

    const info = `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

🌍 *País:* ${data.name || 'N/A'}
🏛️ *Capital:* ${data.capital || 'N/A'}
👥 *Población:* ${data.population ? data.population.toLocaleString() : 'N/A'}
🗣️ *Idiomas:* ${data.languages || 'N/A'}
💵 *Moneda:* ${data.currency || 'N/A'}
🌐 *Dominio:* ${data.tld || 'N/A'}
📍 *Región:* ${data.region || 'N/A'}
🗺️ *Subregión:* ${data.subregion || 'N/A'}
    `.trim()

    if (data.flag) {
      await conn.sendMessage(m.chat, {
        image: { url: data.flag },
        caption: info
      }, { quoted: m })
    } else {
      await conn.reply(m.chat, info, m)
    }
    await m.react('✅')
  } catch (e) {
    console.error('Error en country:', e)
    await conn.reply(m.chat, '❌ Error al buscar el país. Intenta con otro nombre.', m)
    await m.react('❌')
  }
}

handler.command = ['country', 'pais', 'countryinfo']
handler.tags = ['tools']
handler.help = ['country <país>']

export default handler