import axios from 'axios'
import cheerio from 'cheerio'

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
    
    const searchUrl = `https://es.wikipedia.org/wiki/${encodeURIComponent(text)}`
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(data)
    
    let flag = null
    const flagImg = $('.infobox .infobox-image img').attr('src')
    if (flagImg) {
      flag = flagImg.startsWith('//') ? 'https:' + flagImg : flagImg
    }
    
    const infoBox = $('.infobox')
    let capital = 'N/A'
    let population = 'N/A'
    let language = 'N/A'
    let currency = 'N/A'
    let region = 'N/A'
    
    infoBox.find('tr').each((i, row) => {
      const th = $(row).find('th').text().trim()
      const td = $(row).find('td').text().trim()
      
      if (th.includes('Capital') || th.includes('capital')) {
        capital = td
      }
      if (th.includes('Población') || th.includes('población')) {
        population = td.replace(/\[.*?\]/g, '').trim()
      }
      if (th.includes('Idioma') || th.includes('idioma') || th.includes('Idiomas')) {
        language = td.replace(/\[.*?\]/g, '').trim()
      }
      if (th.includes('Moneda') || th.includes('moneda')) {
        currency = td.replace(/\[.*?\]/g, '').trim()
      }
      if (th.includes('Región') || th.includes('región')) {
        region = td.replace(/\[.*?\]/g, '').trim()
      }
    })
    
    const title = $('h1').first().text().trim() || text
    
    const info = `
🐉 GOHAN BEAST — INFORMACIÓN DE PAÍS

🌍 País: ${title}
🏛️ Capital: ${capital}
👥 Población: ${population}
🗣️ Idiomas: ${language}
💵 Moneda: ${currency}
📍 Región: ${region}

⚡ Gohan Beast - Poder Máximo Activado
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
    await conn.reply(m.chat, '❌ País no encontrado. Verifica el nombre.', m)
    await m.react('❌')
  }
}

handler.command = ['country', 'pais', 'countryinfo']
handler.tags = ['tools']
handler.help = ['country <país>']

export default handler