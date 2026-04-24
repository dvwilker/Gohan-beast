import acrcloud from 'acrcloud'
import ytsearch from 'yt-search'
import baileys from '@whiskeysockets/baileys'

const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = q.mimetype || ''
    const mtype = q.mtype || ''

    if (!/audio|video/.test(mime) && !/audioMessage|videoMessage/.test(mtype)) {
      return conn.reply(
        m.chat,
        `✔️ *Usa el comando así:*\n\nEtiqueta un audio o video corto con: *${usedPrefix + command}* para intentar reconocer la canción.`,
        m
      )
    }

    await m.react('🕓')

    const buffer = await q.download?.()
    if (!buffer) throw '❌ No se pudo descargar el archivo. Intenta nuevamente.'

    const result = await acr.identify(buffer)
    const { status, metadata } = result

    if (status.code !== 0) throw status.msg || 'No se pudo identificar la canción.'

    const music = metadata.music?.[0]
    if (!music) throw 'No se encontró información de la canción.'

    const title = music.title || 'Desconocido'
    const artist = music.artists?.map(v => v.name).join(', ') || 'Desconocido'
    const album = music.album?.name || 'Desconocido'
    const release = music.release_date || 'Desconocida'

    const yt = await ytsearch(`${title} ${artist}`)
    const video = yt.videos.length > 0 ? yt.videos[0] : null

    if (video) {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: video.thumbnail } },
        { upload: conn.waUploadToServer }
      )

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `☯ 𝑮𝒐𝒋𝒐𝑩𝒐𝒕 - 𝑴𝑫 ☯  
“ᴇʟ sɪʟᴇɴᴄɪᴏ ᴛᴀᴍʙɪᴇ́ɴ ᴄᴀɴᴛᴀ, ᴘᴇʀᴏ sᴏʟᴏ ʟᴏ ᴇsᴄᴜᴄʜᴀ ᴇʟ ᴅᴏʟᴏʀ.” 🕯️  

🥭 *Título:* ${title}  
📌 *Artista:* ${artist}  
💿 *Álbum:* ${album}  
📆 *Lanzamiento:* ${release}  

⚔️ *Buscando:* ${video.title}  
⏱ *Duración:* ${video.timestamp}  
🔥 *Vistas:* ${video.views.toLocaleString()}  
📺 *Canal:* ${video.author.name}  
🔗 *Enlace:* ${video.url}  

🩸 “ᴇɴ ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ, ʟᴀ ᴍᴜ́sɪᴄᴀ ᴇs ʟᴀ ᴜ́ɴɪᴄᴀ ʟᴜᴢ.” ☯`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: dev
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: '',
                hasMediaAttachment: true,
                imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                      display_text: "ᴄᴏᴘɪᴀʀ - ᴜʀʟ",
                      id: video.url,
                      copy_code: video.url
                    })
                  },
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🌐 Ver en YouTube",
                      url: video.url,
                      merchant_url: video.url
                    })
                  }
                ]
              })
            })
          }
        }
      }, { quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      await m.react('✔️')
    } else {
      //await conn.reply(m.chat, `✔️ Detectado:\n\n🎵 ${title}\n👤 ${artist}`, m)
      //await m.react('❌')
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `> ❌ Error al identificar la música:\n${e}`, m)
  }
}

handler.help = ['whatmusic <audio/video>']
handler.tags = ['tools']
handler.command = ['shazam', 'whatmusic']
handler.register = true

export default handler