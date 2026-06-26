import yts from 'yt-search'
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

    const videoInfo = await searchYouTube(input)

    if (!videoInfo) {
      return m.reply('🐉 *GOHAN BEAST BOT* 🐉\n\n> No encontré resultados para tu búsqueda.')
    }

    const isVideo = command === 'ytmp4doc'
    const format = isVideo ? 'mp4' : 'mp3'
    const extension = isVideo ? '.mp4' : '.mp3'
    const mimetype = isVideo ? 'video/mp4' : 'audio/mpeg'
    const emoji = isVideo ? '🎬' : '🎵'
    const tipoTexto = isVideo ? 'video' : 'audio'

    const downloadUrl = await getDownloadUrl(videoInfo.url, format)
    if (!downloadUrl) {
      return m.reply(`🐉 *GOHAN BEAST BOT* 🐉\n\n> No se encontró el enlace de descarga ${extension.toUpperCase()}.`)
    }

    const views = (videoInfo.views || 0).toLocaleString()
    const channel = videoInfo.author?.name || 'Desconocido'

    const caption = `🐉 *GOHAN BEAST BOT* 🐉

${emoji} *Descargando ${tipoTexto} como documento...*

> 🐉 Título: *${videoInfo.title}*
> 🐉 Canal: *${channel}*
> 🐉 Duración: *${videoInfo.timestamp || 'Desconocida'}*
> 🐉 Vistas: *${views}*
> 🐉 Enlace: *${videoInfo.url}*`

    if (videoInfo.thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: videoInfo.thumbnail },
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
      fileName: `${sanitizeFileName(videoInfo.title)}${extension}`,
      caption: `✅ ${tipoTexto.toUpperCase()} descargado como documento\n\n📄 Título: *${videoInfo.title}*\n📏 Tamaño: *${formatBytes(fileBuffer.length)}*\n\n🐉 *Gohan Power Activated* 🐉`
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

async function searchYouTube(query) {
  const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(query)

  if (isUrl) {
    const videoId = extractVideoId(query)
    if (videoId) {
      const res = await yts({ videoId })
      if (res?.videoId) {
        return {
          title: res.title || 'Video',
          url: `https://youtu.be/${res.videoId}`,
          thumbnail: res.thumbnail || res.image,
          views: res.views || 0,
          timestamp: res.timestamp || 'Desconocida',
          author: res.author
        }
      }
    }
  }

  const res = await yts(query)
  const video = res.videos?.[0] || res.all?.find(v => v.type === 'video')
  return video || null
}

async function getDownloadUrl(ytUrl, format) {
  const url = `${API_BASE}?q=${encodeURIComponent(ytUrl)}&apiKey=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (!data?.status || !data?.result?.length) {
    return null
  }

  return data.result[0]?.download?.[format] || null
}

function extractVideoId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/
  )
  return match?.[1] || null
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