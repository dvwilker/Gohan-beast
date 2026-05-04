import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `🐉 *Ingresa un enlace para descargar*\n\n> *Ejemplo:* ${usedPrefix + command} https://...`, m)

    await m.react('🌀')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')
        let endpoint = ''

        if (/ig|instagram/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/fb|facebook/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/tk|tiktok/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(query)}&key=${key}`
        }

        const { data } = await axios.get(endpoint)
        
        if (!data.status) {
            await m.react('🌀')
            return m.reply('🐉 *La API no devolvió un resultado válido.*')
        }

        let downloadUrl = ''
        let title = 'Archivo Multimedia'

        if (/ig|instagram/i.test(command)) {
            downloadUrl = data.data[0].url
            title = 'Instagram Reel'
        } else if (/fb|facebook/i.test(command)) {
            downloadUrl = data.resultados[0].url
            title = 'Facebook Video'
        } else if (/tk|tiktok/i.test(command)) {
            downloadUrl = data.data.dl
            title = data.data.title || 'TikTok Video'
        }

        if (!downloadUrl) {
            await m.react('❌')
            return m.reply('⚠️ *No se pudo encontrar el enlace de descarga.*')
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   📥 *DESCARGADOR* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `📝 *INFO:* ${title.slice(0, 80)}...\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By:DvWilkerOFC Developer*\n`
        ui += `🌐 *Gohan beast*`

        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            caption: ui,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('🐉')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ *Ocurrió un error al conectar con la API.*')
    }
}

handler.help = ['ig', 'fb', 'tt']
handler.tags = ['download']
handler.command = /^(ig|instagram|ig2|fb|facebook|fb2|tt|tiktok|tiktok2)$/i

export default handler