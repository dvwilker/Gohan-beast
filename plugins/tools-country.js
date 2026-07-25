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
    
    const res = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(text)}`)
    const data = res.data[0]

    if (!data) {
      return conn.reply(m.chat, '❌ País no encontrado.', m)
    }

    const name = data.name?.common || data.name?.official || 'N/A'
    const capital = data.capital?.[0] || 'N/A'
    const population = data.population ? data.population.toLocaleString() : 'N/A'
    const languages = data.languages ? Object.values(data.languages).join(', ') : 'N/A'
    
    let currencyName = 'N/A'
    let currencySymbol = 'N/A'
    if (data.currencies) {
      const firstCurrency = Object.values(data.currencies)[0]
      if (firstCurrency) {
        currencyName = firstCurrency.name || 'N/A'
        currencySymbol = firstCurrency.symbol || 'N/A'
      }
    }
    
    const tld = data.tld?.[0] || 'N/A'
    const independent = data.independent !== undefined ? (data.independent ? '✅ Sí' : '❌ No') : 'N/A'
    const region = data.region || 'N/A'
    const subregion = data.subregion || 'N/A'
    const flag = data.flags?.png || null

    const info = `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

🌍 *País:* ${name}
🏛️ *Capital:* ${capital}
👥 *Población:* ${population}
🗣️ *Idiomas:* ${languages}
💵 *Moneda:* ${currencyName} (${currencySymbol})
🌐 *Dominio:* ${tld}
📅 *Independencia:* ${independent}
📍 *Región:* ${region}
🗺️ *Subregión:* ${subregion}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim()

    if (flag) {
      await conn.sendMessage(m.chat, {
        image: { url: flag },
        caption: info
      }, { quoted: m })
    } else {
      await conn.reply(m.chat, info, m)
    }
    await m.react('✅')
  } catch (e) {
    console.error('Error en country:', e)
    await conn.reply(m.chat, '❌ País no encontrado. Verifica el nombre o intenta con otro país.', m)
    await m.react('❌')
  }
}

handler.command = ['country', 'pais', 'countryinfo']
handler.tags = ['tools']
handler.help = ['country <país>']

export default handler