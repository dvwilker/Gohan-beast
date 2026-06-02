import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@whiskeysockets/baileys'

let pendientes = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║ - TIKTOK',
        subtitle: 'Descarga videos estilo 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉',
        hasMediaAttachment: false
      },
      body: {
        text: `> 🐉 ¡Hola, bienvenida/o a 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃! ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *COMANDO ::* ${usedPrefix + command}
𑁍𓂃 𓈒𓏸 *USO ::* Envía un enlace de TikTok o una búsqueda

> 🐉 *𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 By DvWilkerOFC 🐉*`
      },
      footer: {
        text: '🐉 ║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎵 TIKTOK',
            sections: [{
              title: '🐉 ENLACE O BÚSQUEDA',
              rows: [{
                header: '🫠 DESCARGA DIRECTA',
                title: '🎵 PEGAR LINK O NOMBRE',
                description: 'Ejemplo: https://vm.tiktok.com/... o Goku',
                id: `tiktok `
              }]
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  await m.react('🎵')

  let query = text.trim()
  let isDirectLink = query.includes('tiktok.com') || query.includes('vm.tiktok.com')

  try {
    if (!isDirectLink) {
      const searchUrl = `https://api-de-el-vigilante-8jnf.onrender.com/search/tiktok?query=${encodeURIComponent(query)}`
      const searchRes = await fetch(searchUrl)
      const searchData = await searchRes.json()

      if (!searchData.status || !searchData.resultados?.length) {
        throw new Error('No se encontraron resultados')
      }

      const resultados = searchData.resultados.slice(0, 5)

      const rows = resultados.map((video, i) => ({
        header: `🎵 ${video.autor || 'Desconocido'}`,
        title: (video.titulo || 'Sin título').substring(0, 35),
        description: `⏱️ ${video.duracion || '?'}s | 🐉 ${video.vistas || '?'}`,
        id: `tt_${i}_${Buffer.from(video.tiktok_url).toString('base64')}_${Buffer.from(video.titulo || 'video').toString('base64')}`
      }))

      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: {
          title: '║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║ - TIKTOK',
          subtitle: 'Selecciona tu video 🐉',
          hasMediaAttachment: false
        },
        body: {
          text: `> 🐉 Resultados encontrados ⸜(｡˃ ᵕ ˂ )⸝♡

𑁍𓂃 𓈒𓏸 *BÚSQUEDA ::* ${query}
𑁍𓂃 𓈒𓏸 *RESULTADOS ::* ${resultados.length}

> 🐉 *𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 By DvWilkerOFC* 🐉`
        },
        footer: {
          text: '🐉 ║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║'
        },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🎵 VER RESULTADOS',
              sections: [{
                title: '📋 SELECCIONA UN VIDEO',
                rows
              }]
            })
          }]
        }
      })

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage
            }
          }
        },
        { quoted: m }
      )

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return
    }

    await conn.sendMessage(m.chat, { text: '𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 *Procesando video en 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃...* 🐉' }, { quoted: m })

    const downloadUrl = `https://api-de-el-vigilante-8jnf.onrender.com/download/tiktok?url=${encodeURIComponent(query)}`
    const response = await fetch(downloadUrl)
    const data = await response.json()

    if (!data.status || !data.tiktok_url) {
      throw new Error('No se pudo obtener el video')
    }

    const { titulo, autor, cover, tiktok_url, duracion, descargar } = data

    const chatId = m.chat
    pendientes[chatId] = {
      url: `https://api-de-el-vigilante-8jnf.onrender.com${descargar}`,
      title: titulo || 'tiktok'
    }

    setTimeout(() => {
      if (pendientes[chatId]) delete pendientes[chatId]
    }, 60000)

    let media = null
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    if (cover) {
      const thumbPath = path.join(tmpDir, `thumb_${Date.now()}.jpg`)
      const thumbRes = await fetch(cover)
      if (thumbRes.ok) {
        const thumbBuffer = await thumbRes.buffer()
        fs.writeFileSync(thumbPath, thumbBuffer)
        media = await prepareWAMessageMedia(
          { image: fs.readFileSync(thumbPath) },
          { upload: conn.waUploadToServer }
        )
        fs.unlinkSync(thumbPath)
      }
    }

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      header: {
        title: '║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║ - TIKTOK',
        subtitle: 'Descarga TikTok 🐉',
        hasMediaAttachment: !!media,
        imageMessage: media ? media.imageMessage : undefined
      },
      body: {
        text: `> 🐉 Video listo ⸜(｡˃ ᵕ ˂ )⸝♡

🐉𓂃 𓈒𓏸 *TÍTULO ::* ${titulo || 'Sin título'}
🐉𓂃 𓈒𓏸 *AUTOR ::* ${autor || 'Desconocido'}
🐉𓂃 𓈒𓏸 *DURACIÓN ::* ${duracion || '?'}s

> 🐉 *𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 desarrollado por DvWilkerOFC* 🐉`
      },
      footer: {
        text: '🐉 ║🐉 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃 🐉║'
      },
      nativeFlowMessage: {
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '🎵 DESCARGAR',
            sections: [{
              title: '✅ VIDEO ENCONTRADO',
              rows: [{
                header: '📥 TOCA PARA DESCARGAR',
                title: (titulo || 'TikTok video').substring(0, 35),
                description: `Por: ${autor || 'Desconocido'}`,
                id: `tt_download_${chatId}`
              }]
            }]
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (error) {
    console.error(error)
    await m.react('🐉')
    m.reply(`🐉 Error en 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃🐉`)
  }
}

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt', 'tik']

export default handler