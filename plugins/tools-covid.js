import axios from 'axios'
import moment from 'moment-timezone'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — COVID-19

⚡ Muestra estadísticas de COVID-19 de un país.

📌 Uso: .covid <país>
📌 Ejemplo: .covid Venezuela
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const res = await axios.get(`https://disease.sh/v3/covid-19/countries/${text}`)
    const data = res.data

    const fecha = moment(data.updated).tz('America/Caracas').format('DD/MM/YYYY HH:mm:ss')

    const info = `
🐉 GOHAN BEAST — COVID-19

🌍 País: ${data.country}
📊 Casos totales: ${data.cases.toLocaleString()}
📈 Casos activos: ${data.active.toLocaleString()}
💀 Muertes: ${data.deaths.toLocaleString()}
🔄 Recuperados: ${data.recovered.toLocaleString()}
📅 Última actualización: ${fecha} (Hora Venezuela)

⚡ Gohan Beast - Poder Máximo Activado
    `.trim()

    if (data.countryInfo?.flag) {
      await conn.sendMessage(m.chat, {
        image: { url: data.countryInfo.flag },
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

handler.command = ['covid', 'covid19']
handler.tags = ['tools']
handler.help = ['covid <país>']

export default handler