import fetch from 'node-fetch'

const API_BASE = 'https://yosoyyo-api-ofc.onrender.com/api/youtube'
const API_KEY = 'free_key'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> Por favor, menciona el nombre o URL del video que deseas descargar')
    }

    const input = args.join(' ').trim()

    await m.react('🕘')

    const video = await fetchYouTube(input)

    if (!video) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> No encontré resultados para tu búsqueda.')
    }

    const mp4Url = video.download?.mp4
    if (!mp4Url) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> No se encontró el enlace de descarga MP4.')
    }

    const views = 'N/A'
    const channel = video.channelName || 'Desconocido'

    const info_message = `🐉 *GOHAN BEAST BOT* 🐉

⚡ *Descargando video...*

> 🐉 Título: *${video.title || 'Sin título'}*
> 🐉 Canal: *${channel}*
> 🐉 Duración: *${video.duration || 'Desconocida'}*
> 🐉 Enlace YT: *${video.videoUrl || 'N/A'}*`

    if (video.thumbnailUrl) {
      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnailUrl },
        caption: info_message
      }, { quoted: m })
    } else {
      await m.reply(info_message)
    }

    const fileRes = await fetch(mp4Url)
    if (!fileRes.ok) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> Error al descargar el archivo de video.')
    }

    const fileBuffer = Buffer.from(await fileRes.arrayBuffer())

    await conn.sendMessage(m.chat, {
      video: fileBuffer,
      fileName: `${sanitizeFileName(video.title || 'video')}.mp4`,
      mimetype: 'video/mp4',
      caption: `🐉 *VIDEO DESCARGADO* 🐉

⚡ Título: *${video.title || 'video'}*
🐉 Tamaño: *${formatBytes(fileBuffer.length)}*

*Gohan Power Activated* 🐉`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply(
      `🐉 *GOHAN BEAST BOT* 🐉\n\n> Error al ejecutar el comando *${usedPrefix + command}*.\n⚡ [Error: *${e.message}*]`
    )
    await m.react('⚠️')
  }
}

handler.command = ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo']
handler.help = ['playvideo']
handler.tags = ['descargas']
handler.register = false

export default handler

async function fetchYouTube(query) {
  const url = `${API_BASE}?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (!data?.status || !data?.result?.length) {
    return null
  }

  return data.result[0]
}

function sanitizeFileName(name = 'video') {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'video'
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}