import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `🐉 *Ingresa un enlace de Facebook para descargar*\n\n> *Ejemplo:* ${usedPrefix + command} https://facebook.com/...`, m)

    await m.react('🌀')

    try {
        // API de Facebook sin API key
        const apiUrl = `https://api-gohan.onrender.com/download/facebook?url=${encodeURIComponent(query)}`
        
        const { data } = await axios.get(apiUrl)

        // Verificar la estructura de respuesta de esta API
        if (!data || !data.resultados || !data.resultados.length) {
            await m.react('❌')
            return m.reply('🐉 *No se pudo obtener el video. Verifica el enlace.*')
        }

        // Obtener la URL del primer resultado
        const downloadUrl = data.resultados[0].url
        
        if (!downloadUrl) {
            await m.react('❌')
            return m.reply('⚠️ *No se pudo encontrar el enlace de descarga.*')
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   📥 *DESCARGADOR* ┃\n`
        ui += `┃      FACEBOOK     ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `📝 *CALIDAD:* ${data.resultados[0].quality || 'HD'}\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: DvWilkerOFC*\n`
        ui += `🌐 *Gohan Beast*`

        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            caption: ui,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('🐉')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ *Error al conectar con la API. Verifica el enlace o intenta más tarde.*')
    }
}

handler.help = ['fb', 'facebook']
handler.tags = ['descargas']
handler.command = /^(fb|facebook|fb2|faceboo)$/i