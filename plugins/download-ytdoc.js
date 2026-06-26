import fetch from 'node-fetch'

const API_BASE = 'https://yosoyyo-api-ofc.onrender.com/api/youtube'
const API_KEY = 'free_key'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> Por favor, menciona el nombre o URL del video de YouTube.')
    }

    const input = args.join(' ').trim()

    await m.react('🕘')

    const video = await fetchYouTube(input)

    if (!video) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> No encontré resultados para tu búsqueda.')
    }

    const isVideo = command === 'ytmp4doc'
    const downloadUrl = isVideo ? video.download?.mp4 : video.download?.mp3
    const extension = isVideo ? '.mp4' : '.mp3'
    const mimetype = isVideo ? 'video/mp4' : 'audio/mpeg'
    const emoji = isVideo ? '🎬' : '🎵'
    const tipoTexto = isVideo ? 'video' : 'audio'

    if (!downloadUrl) {
      return m.reply(`🐉 *GOHAN BEAST BOT* 🐉\n\n> No se encontró el enlace de descarga ${extension.toUpperCase()}.`)
    }

    const channel = video.channelName || 'Desconocido'

    const caption = `🐉 *GOHAN BEAST BOT* 🐉

${emoji} *Descargando ${tipoTexto} como documento...*

> 🐉 Título: *${video.title || 'Sin título'}*
> 🐉 Canal: *${channel}*
> 🐉 Duración: *${video.duration || 'Desconocida'}*
> 🐉 Enlace YT: *${video.videoUrl || 'N/A'}*`

    if (video.thumbnailUrl) {
      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnailUrl },
        caption
      }, { quoted: m })
    } else {
      await m.reply(caption)
    }

    const fileRes = await fetch(downloadUrl)
    if (!fileRes.ok) {
      return m.reply(`🐉 *GOHAN BEAST BOT* 🐉\n\n> Error al descargar el archivo ${tipoTexto}.`)
    }

    const fileBuffer = Buffer.from(await fileRes.arrayBuffer())

    await conn.sendMessage(m.chat, {
      document: fileBuffer,
      mimetype,
      fileName: `${sanitizeFileName(video.title || tipoTexto)}${extension}`,
      caption: `✅ ${tipoTexto.toUpperCase()} descargado como documento\n\n📄 Título: *${video.title || tipoTexto}*\n📏 Tamaño: *${formatBytes(fileBuffer.length)}*\n\n🐉 *Gohan Power Activated* 🐉`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.reply(`🐉 *GOHAN BEAST BOT* 🐉\n\n> Error al ejecutar el comando *${usedPrefix + command}*.\n⚡ [Error: *${e.message}*]`)
    await m.react('⚠️')
  }
}

handler.command = ['ytmp3doc', 'ytmp4doc']
handler.help = ['ytmp3doc', 'ytmp4doc']
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

function sanitizeFileName(name = 'file') {
  return name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'file'
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}