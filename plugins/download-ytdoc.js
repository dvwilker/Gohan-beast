import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("🎶 Ingresa el nombre o enlace del video de YouTube.")

  await m.react("🕘")

  try {
    let url = text.trim()
    let title = "Desconocido"
    let authorName = "Desconocido"
    let durationTimestamp = "Desconocida"
    let views = 0
    let thumbnail = ""

    const isUrl = /^https?:\/\/\S+/i.test(url)

    if (isUrl) {
      if (!isYouTubeUrl(url)) {
        return m.reply("🚫 El enlace no es válido de YouTube.")
      }

      const videoId = extractVideoId(url)
      if (!videoId) {
        return m.reply("🚫 No pude extraer el ID del video.")
      }

      const res = await yts({ videoId })

      if (!res) {
        return m.reply("🚫 No pude obtener información del video.")
      }

      title = res.title || title
      authorName = res.author?.name || authorName
      durationTimestamp = res.timestamp || durationTimestamp
      views = res.views || views
      thumbnail = res.thumbnail || thumbnail
      url = res.url || url
    } else {
      const res = await yts(url)

      if (!res?.videos?.length) {
        return m.reply("🚫 No encontré nada.")
      }

      const video = res.videos[0]
      title = video.title || title
      authorName = video.author?.name || authorName
      durationTimestamp = video.timestamp || durationTimestamp
      views = video.views || views
      url = video.url || url
      thumbnail = video.thumbnail || thumbnail
    }

    const vistas = formatViews(views)

    const fallbackThumbRes = await fetch("https://i.ibb.co/83pbxQN/5eecaebbc7c3.jpg")
    const fallbackThumb = Buffer.from(await fallbackThumbRes.arrayBuffer())

    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        locationMessage: {
          name: `『 ${title} 』`,
          jpegThumbnail: fallbackThumb
        }
      }
    }

    const caption = `
✧━───『 _info del documento_ 』───━✧

🎼 _título_: ${title}
⏳ _duración_: ${durationTimestamp}
🌐 _enlace_: ${url}
📚 _api_ https://api-gohan.onrender.com

     ✧━『 _GOHAN BEAST_ 』━✧
    🐉 _Powered by wilker_ 🐉
`

    let thumb = fallbackThumb

    if (thumbnail) {
      try {
        thumb = (await conn.getFile(thumbnail)).data
      } catch {
        thumb = fallbackThumb
      }
    }

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption
      },
      { quoted: fkontak }
    )

    // Descargar según el comando (solo documentos)
    if (command === "ytmp4doc") {
      await downloadAsDocument(conn, m, url, fkontak, title, "video")
    } else if (command === "ytmp3doc") {
      await downloadAsDocument(conn, m, url, fkontak, title, "audio")
    } else {
      return m.reply("❌ Comando no válido. Usa:\n• /ytmp3doc - Audio como documento\n• /ytmp4doc - Video como documento")
    }
    
    await m.react("✅")
  } catch (e) {
    console.error(e)
    await m.reply("❌ Error: " + e.message)
    await m.react("⚠️")
  }
}

// Descargar como documento
const downloadAsDocument = async (conn, m, url, quotedMsg, title, type) => {
  try {
    const isVideo = type === "video"
    const emoji = isVideo ? "🎬" : "🎵"
    const tipoTexto = isVideo ? "video" : "audio"
    const extension = isVideo ? ".mp4" : ".mp3"
    const apiEndpoint = isVideo ? "ytvideo" : "ytaudio"
    
    const sent = await conn.sendMessage(
      m.chat,
      { text: `${emoji} Descargando ${tipoTexto} como documento...` },
      { quoted: m }
    )

    const apiUrl = `https://api-gohan.onrender.com/download/${apiEndpoint}?url=${encodeURIComponent(url)}`
    const r = await fetch(apiUrl)

    if (!r.ok) {
      return m.reply(`🚫 Error HTTP ${r.status} al obtener el ${tipoTexto}.`)
    }

    const data = await r.json()

    if (!data?.status || !data?.result?.download_url) {
      return m.reply(`🚫 No se pudo obtener el ${tipoTexto}.`)
    }

    const fileUrl = data.result.download_url
    const fileTitle = cleanName(data.result.title || title || tipoTexto)
    
    // Mostrar mensaje de descarga
    await conn.sendMessage(
      m.chat,
      { text: `${emoji} Descargando archivo, por favor espera...` },
      { quoted: m }
    )
    
    // Descargar el archivo como buffer
    const fileRes = await fetch(fileUrl)
    const fileBuffer = Buffer.from(await fileRes.arrayBuffer())
    
    // Enviar como documento
    await conn.sendMessage(
      m.chat,
      {
        document: fileBuffer,
        mimetype: isVideo ? "video/mp4" : "audio/mpeg",
        fileName: `${fileTitle}${extension}`,
        caption: `✅ ${tipoTexto.toUpperCase()} descargado como documento\n\n📄 Título: ${fileTitle}\n📏 Tamaño: ${formatBytes(fileBuffer.length)}`
      },
      { quoted: quotedMsg }
    )

    try {
      await conn.sendMessage(
        m.chat,
        {
          text: `✅ Descarga completada\n\n📄 ${tipoTexto.toUpperCase()} guardado como documento: ${fileTitle}`,
          edit: sent.key
        }
      )
    } catch {
      // Ignorar error de edición
    }
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error al descargar ${type === "video" ? "video" : "audio"} como documento: ` + e.message)
    await m.react("💀")
  }
}

const cleanName = (name) =>
  String(name).replace(/[^\w\s._-]/gi, "").substring(0, 50)

const formatViews = (views) => {
  const n = Number(views)
  if (!n || Number.isNaN(n)) return "No disponible"
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toString()
}

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const isYouTubeUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)
}

const extractVideoId = (url) => {
  const match =
    url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&/]|\b)/) ||
    url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/)
  return match?.[1] || null
}

handler.command = ["ytmp3doc", "ytmp4doc"]
handler.tags = ["download"]
handler.help = ['ytmp3doc', 'ytmp4doc'];
handler.register = false

export default handler