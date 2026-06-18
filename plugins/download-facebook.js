import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

const BASE_API = 'https://api-gohan-v1.onrender.com'
let pendientes = {}

function crearMensaje(chat, text, buttons, m, media = null) {
  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: {
      title: '🐉 GOHAN BEAST — FACEBOOK',
      subtitle: 'Video Downloader ~ Poder Divino',
      hasMediaAttachment: !!media,
      imageMessage: media?.imageMessage
    },
    body: { text },
    footer: { text: '⚡ Gohan Beast - Poder Máximo Activado' },
    nativeFlowMessage: { buttons }
  })

  return generateWAMessageFromContent(
    chat,
    { viewOnceMessage: { message: { messageContextInfo: {}, interactiveMessage } } },
    { quoted: m }
  )
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    const bodyText = [
      `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
      `┃`,
      `┃ 💡 *Uso:*`,
      `┃ ${usedPrefix + command} <link de Facebook>`,
      `┃`,
      `┃ 📌 *Ejemplos:*`,
      `┃ ➤ ${usedPrefix + command} facebook.com/watch?v=...`,
      `┃ ➤ ${usedPrefix + command} fb.watch/...`,
      `┃`,
      `┃ 🙏 *API by @ElVigilante`,
      `┃`,
      `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    ].join('\n')

    const buttons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '🐉 Facebook Downloader',
        sections: [{
          title: '💡 Cómo usar',
          rows: [{
            header: '📥 Descargar video',
            title: 'Pegar link de Facebook',
            description: 'Ej: facebook.com/watch?v=...',
            id: `fb_help_${m.chat}`
          }]
        }]
      })
    }]

    const msg = crearMensaje(m.chat, bodyText, buttons, m)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  const esFacebook = text.includes('facebook.com') ||
                     text.includes('fb.watch') ||
                     text.includes('fb.com')

  if (!esFacebook) {
    return m.reply([
      `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
      `┃`,
      `┃ ❌ *Link inválido~*`,
      `┃ Solo se aceptan enlaces de Facebook~`,
      `┃`,
      `┃ 💡 Ejemplo:`,
      `┃ facebook.com/watch?v=...`,
      `┃`,
      `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    ].join('\n'))
  }

  await m.react('🐉')

  try {
    await conn.sendMessage(m.chat, {
      text: [
        `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
        `┃`,
        `┃ ⏳ *Procesando video con poder divino...*`,
        `┃ 💡 Por favor espera guerrero~`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
      ].join('\n')
    }, { quoted: m })

    const apiUrl = `${BASE_API}/download/facebook?url=${encodeURIComponent(text)}`

    const res = await Promise.race([
      fetch(apiUrl),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 15000))
    ])

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()

    if (!data?.result?.download_url) throw new Error('Sin URL de descarga')

    const { title, duration, thumbnail, download_url } = data.result

    const min = Math.floor((duration || 0) / 60)
    const seg = (duration || 0) % 60
    const durStr = `${min}:${String(seg).padStart(2, '0')}`

    const chatId = m.chat
    pendientes[chatId] = { url: download_url, title: title || 'Video Facebook' }
    setTimeout(() => delete pendientes[chatId], 60000)

    let media = null
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    if (thumbnail) {
      try {
        const thumbPath = path.join(tmpDir, `fb_${Date.now()}.jpg`)
        const thumbRes = await fetch(thumbnail)
        if (thumbRes.ok) {
          fs.writeFileSync(thumbPath, Buffer.from(await thumbRes.arrayBuffer()))
          media = await prepareWAMessageMedia(
            { image: fs.readFileSync(thumbPath) },
            { upload: conn.waUploadToServer }
          )
          fs.unlinkSync(thumbPath)
        }
      } catch {}
    }

    const bodyText = [
      `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
      `┃`,
      `┃ 📹 *Título:* ${(title || 'Sin título').slice(0, 50)}`,
      `┃ ⏱️ *Duración:* ${durStr}`,
      `┃`,
      `┃ 👇 *Toca para descargar~*`,
      `┃`,
      `┃ ╭─〔 🙏 *CRÉDITOS* 〕`,
      `┃ │ 👨‍💻 *API by:* @ElVigilante`,
      `┃ ╰────────────⬣`,
      `┃`,
      `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    ].join('\n')

    const buttons = [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '📥 Descargar Video',
        sections: [{
          title: '✅ VIDEO LISTO',
          rows: [{
            header: '📹 MP4',
            title: (title || 'Video').slice(0, 35),
            description: `⏱️ ${durStr} — Toca para descargar`,
            id: `fb_download_${chatId}`
          }]
        }]
      })
    }]

    const msg = crearMensaje(m.chat, bodyText, buttons, m, media)
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en facebook dl:', e.message)
    await m.react('❌')
    m.reply([
      `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
      `┃`,
      `┃ ❌ *Error al procesar el video~*`,
      `┃`,
      `┃ 💡 *Posibles causas:*`,
      `┃ ➤ El video es privado`,
      `┃ ➤ Link incorrecto`,
      `┃ ➤ API no disponible`,
      `┃`,
      `┃ 🔄 Intenta de nuevo guerrero~`,
      `┃`,
      `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
    ].join('\n'))
  }
}

handler.before = async (m, { conn }) => {
  const nativeFlow = m.message?.interactiveResponseMessage?.nativeFlowResponseMessage
  if (!nativeFlow) return false

  try {
    const data = JSON.parse(nativeFlow.paramsJson || '{}')
    const id = data.id || data.selectedId || null
    if (!id) return false

    if (id.startsWith('fb_help_')) {
      await conn.sendMessage(m.chat, {
        text: [
          `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
          `┃`,
          `┃ 💡 *Envía el link así:*`,
          `┃ .fb https://facebook.com/watch?v=...`,
          `┃`,
          `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n')
      }, { quoted: m })
      return true
    }

    if (!id.startsWith('fb_download_')) return false

    const chatId = id.replace('fb_download_', '')
    const pendiente = pendientes[chatId]

    if (!pendiente) {
      await conn.sendMessage(m.chat, {
        text: [
          `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
          `┃`,
          `┃ ❌ *Enlace expirado~*`,
          `┃ 💡 Usa *.fb* de nuevo guerrero~`,
          `┃`,
          `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
        ].join('\n')
      }, { quoted: m })
      return true
    }

    await m.react('⏳')
    await conn.sendMessage(m.chat, {
      text: [
        `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
        `┃`,
        `┃ ⏳ *Descargando video con poder divino...*`,
        `┃ 📹 ${pendiente.title.slice(0, 40)}`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
      ].join('\n')
    }, { quoted: m })

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const filePath = path.join(tmpDir, `fb_${Date.now()}.mp4`)

    const videoRes = await Promise.race([
      fetch(pendiente.url),
      new Promise((_, rej) => setTimeout(() => rej('timeout'), 30000))
    ])

    if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}`)

    fs.writeFileSync(filePath, Buffer.from(await videoRes.arrayBuffer()))

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: 'video/mp4',
      fileName: `${pendiente.title.slice(0, 50)}.mp4`,
      caption: [
        `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
        `┃`,
        `┃ ✅ *¡Descarga completada guerrero!*`,
        `┃ 📹 ${pendiente.title.slice(0, 40)}`,
        `┃`,
        `┃ ╭─〔 🙏 *CRÉDITOS* 〕`,
        `┃ │ 👨‍💻 *API by:* @DvWilkerOFC`,
        `┃ ╰────────────⬣`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
      ].join('\n')
    }, { quoted: m })

    fs.unlinkSync(filePath)
    delete pendientes[chatId]
    await m.react('✅')
    return true

  } catch (e) {
    console.error('❌ Error en before facebook:', e.message)
    await conn.sendMessage(m.chat, {
      text: [
        `╭━━━〔 🐉 *GOHAN BEAST — FACEBOOK* 〕━━⬣`,
        `┃`,
        `┃ ❌ *Error al descargar~*`,
        `┃ 🔄 Intenta de nuevo guerrero`,
        `┃`,
        `╰━━━━━━━━━━━━━━━━━━━━━━⬣`
      ].join('\n')
    }, { quoted: m })
    await m.react('❌')
    return true
  }
}

handler.command = ['facebook', 'fb', 'fbdl', 'gohanfb']
handler.help = ['fb <url>']
handler.tags = ['descargas']
handler.desc = 'Descarga videos de Facebook con poder divino 🐉'

export default handler