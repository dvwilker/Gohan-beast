import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

⚡ Muestra información de cualquier país.

📌 Uso: .country <país>
📌 Ejemplo: .country Venezuela
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const res = await axios.get(`https://restcountries.com/v3.1/name/${text}`)
    const data = res.data[0]

    const info = `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

🌍 *País:* ${data.name.common}
🏛️ *Capital:* ${data.capital?.[0] || 'N/A'}
👥 *Población:* ${data.population.toLocaleString()}
🗣️ *Idiomas:* ${Object.values(data.languages || {}).join(', ')}
💵 *Moneda:* ${Object.values(data.currencies || {})[0]?.name || 'N/A'} (${Object.values(data.currencies || {})[0]?.symbol || 'N/A'})
🌐 *Dominio:* ${data.tld?.[0] || 'N/A'}
📅 *Independencia:* ${data.independent ? '✅ Sí' : '❌ No'}
📍 *Región:* ${data.region || 'N/A'}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim()

    if (data.flags?.png) {
      await conn.sendMessage(m.chat, {
        image: { url: data.flags.png },
        caption: info
      }, { quoted: m })
    } else {
      await conn.reply(m.chat, info, m)
    }
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ País no encontrado.', m)
    await m.react('❌')
  }
}

handler.command = ['country', 'pais', 'countryinfo']
handler.tags = ['tools']
handler.help = ['country <país>']

export default handler