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
    
    const flagImg = $('.infobox img').filter((i, el) => {
      const src = $(el).attr('src') || ''
      return src.includes('Bandera') || src.includes('Flag') || src.includes('flag') || src.includes('bandera')
    }).first().attr('src')
    
    if (flagImg) {
      flag = flagImg.startsWith('//') ? 'https:' + flagImg : flagImg
    } else {
      const img = $('.infobox .infobox-image img').first().attr('src')
      if (img) {
        flag = img.startsWith('//') ? 'https:' + img : img
      }
    }
    
    const infoBox = $('.infobox')
    let capital = 'N/A'
    let population = 'N/A'
    let language = 'N/A'
    let currency = 'N/A'
    let region = 'N/A'
    let president = 'N/A'
    
    infoBox.find('tr').each((i, row) => {
      const th = $(row).find('th').text().trim()
      const td = $(row).find('td').text().trim()
      const tdHtml = $(row).find('td').html() || ''
      
      if (th.includes('Capital') || th.includes('capital')) {
        const clean = td.replace(/\[.*?\]/g, '').split(' ')[0]
        capital = clean
      }
      if (th.includes('Población') || th.includes('población')) {
        const clean = td.replace(/\[.*?\]/g, '').replace(/[^\d\s,]/g, '').trim()
        if (clean) {
          const numbers = clean.match(/[\d,.]+/g)
          population = numbers ? numbers[0] : 'N/A'
        }
      }
      if (th.includes('Idioma') || th.includes('idioma') || th.includes('Idiomas')) {
        const clean = td.replace(/\[.*?\]/g, '').split(',')[0].trim()
        language = clean
      }
      if (th.includes('Moneda') || th.includes('moneda')) {
        let clean = td.replace(/\[.*?\]/g, '').trim()
        const match = clean.match(/([a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+)/)
        if (match) {
          currency = match[1].trim()
        } else {
          currency = clean
        }
      }
      if (th.includes('Región') || th.includes('región')) {
        const clean = td.replace(/\[.*?\]/g, '').trim()
        region = clean
      }
      if (th.includes('Presidente') || th.includes('presidente') || th.includes('Presidenta') || th.includes('presidenta') || th.includes('Jefe de Estado') || th.includes('jefe de estado')) {
        const clean = td.replace(/\[.*?\]/g, '').trim()
        president = clean
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
👑 Presidente: ${president}
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