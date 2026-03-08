import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("🎶 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 𝙽𝙾𝙼𝙱𝚁𝙴 𝙳𝙴 𝙻𝙰 𝙼𝚄𝚂𝙸𝙲 𝙳𝙴 𝚈𝙾𝚄𝚃𝚄𝙱𝙴.")

  await m.react("🐉")

  try {
    let url = text
    let title = "Desconocido"
    let authorName = "Desconocido"
    let durationTimestamp = "Desconocida"
    let views = "Desconocidas"
    let thumbnail = ""

    if (!text.startsWith("https://")) {
      const res = await yts(text)
      if (!res?.videos?.length) return m.reply("🚫 No encontré nada.")
      const video = res.videos[0]
      title = video.title
      authorName = video.author?.name
      durationTimestamp = video.timestamp
      views = video.views
      url = video.url
      thumbnail = video.thumbnail
    }

    const vistas = formatViews(views)

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg")
    const thumb3 = Buffer.from(await res3.arrayBuffer())

    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        locationMessage: {
          name: `『 ${title} 』`,
          jpegThumbnail: thumb3
        }
      }
    }

    const caption = `
  ✧━『 𝙸𝙽𝙵𝙾 𝙳𝙴𝙻 𝙰𝚄𝙳𝙸𝙾 』━✧

🎼 𝚃𝙸𝚃𝚄𝙻𝙾: ${title}
📺 𝙲𝙰𝙽𝙰𝙻: ${authorName}
👁️ 𝚅𝙸𝚂𝚃𝙰𝚂: ${vistas}
⏳ 𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽: ${durationTimestamp}
🌐 𝙴𝙽𝙻𝙰𝙲𝙴: ${url}

  ✧━『 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 𝙱𝙾𝚃 』━✧
     🐉 𝙿𝙾𝚆𝙴𝚁𝙴 𝙱𝚈 𝚆𝙸𝙻𝙺𝙴𝚁 🐉
`

    const thumb = (await conn.getFile(thumbnail)).data

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption,
        footer: "🐉 𝙶𝙾𝙷𝙰𝙽 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂 𝚁𝙰𝙿𝙸𝙳𝙰𝚂 🐉",
        headerType: 4
      },
      { quoted: fkontak }
    )

    await downloadMedia(conn, m, url, fkontak)

    await m.react("✅")
  } catch (e) {
    m.reply("❌ Error: " + e.message)
    m.react("⚠️")
  }
}

const fetchBuffer = async (url) => {
  const response = await fetch(url)
  return await response.buffer()
}

const downloadMedia = async (conn, m, url, quotedMsg) => {
  try {
    const sent = await conn.sendMessage(
      m.chat,
      { text: "🎵 𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝙽𝙳𝙾 𝙰𝚄𝙳𝙸𝙾..." },
      { quoted: m }
    )

    const apiUrl = `https://api-adonix.ultraplus.click/download/ytaudio?url=${encodeURIComponent(url)}&apikey=KEYGOHANBOT`
    const r = await fetch(apiUrl)
    const data = await r.json()

    if (!data?.status || !data?.data?.url)
      return m.reply("🚫 No se pudo descargar el archivo.")

    const fileUrl = data.data.url
    const fileTitle = cleanName(data.data.title || "audio")

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: fileUrl },
        mimetype: "audio/mpeg",
        fileName: fileTitle + ".mp3",
        ptt: false
      },
      { quoted: quotedMsg }
    )

    await conn.sendMessage(
      m.chat,
      { text: `✅ Descarga completada\n\n🎼 Título: ${fileTitle}`, edit: sent.key }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    m.reply("❌ Error: " + e.message)
    m.react("💀")
  }
}

const cleanName = (name) =>
  name.replace(/[^\w\s-_.]/gi, "").substring(0, 50)

const formatViews = (views) => {
  if (views === undefined || views === null) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K`
  return views.toString()
}

handler.command = ["play", "yt", "ytsearch"]
handler.tags = ["descargas"]
handler.register = false

export default handler