const handler = async (m, { args, conn, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      const helpMsg = `🐉 *GOHAN BEAST — FACEBOOK* 🐉

⚡ Envía un enlace de Facebook para descargar.

📌 *Ejemplo:*
${usedPrefix + command} https://facebook.com/watch?v=...

💡 *Comandos:*
➤ ${usedPrefix}fb <link> - Descargar video
➤ ${usedPrefix}fbaudio <link> - Descargar solo audio

🐉 *Gohan Beast - Poder Máximo Activado*`
      
      return conn.reply(m.chat, helpMsg, m)
    }

    let videoUrl = ''
    let audioUrl = ''
    let title = 'Facebook Video'
    let isAudio = command === 'fbaudio' || command === 'facebookaudio'

    if (m.react) await m.react('🐉')

    try {
      const api = `https://yosoyyo-api-ofc.onrender.com/api/facebook?url=${encodeURIComponent(args[0])}&apiKey=free_key`
      const res = await fetch(api)
      const json = await res.json()

      if (json?.result?.download_url) {
        videoUrl = json.result.download_url
        title = json.result.title || 'Facebook Video'
      }

      if (json?.result?.audio_url) {
        audioUrl = json.result.audio_url
      }

    } catch (e) {
      console.log('Gohan API error:', e.message)
    }

    if (!videoUrl && !audioUrl) {
      return conn.reply(
        m.chat,
        '🐉 *GOHAN BEAST* 🐉\n\n❌ No se pudo obtener el contenido del enlace.\n\n💡 Posibles causas:\n➤ El video es privado\n➤ Link incorrecto\n➤ El video no existe',
        m
      )
    }

    if (isAudio) {
      if (audioUrl) {
        await conn.sendFile(
          m.chat,
          audioUrl,
          'facebook-audio.mp3',
          `🐉 *GOHAN BEAST — FACEBOOK AUDIO* 🐉

✅ Aquí tienes tu audio guerrero.

🎵 *Título:* ${title}
🎵 *Formato:* MP3
⚡ Poder Máximo Activado`,
          m
        )
        if (m.react) await m.react('✅')
      } else {
        await conn.reply(m.chat, '🐉 *GOHAN BEAST* 🐉\n\n❌ No se encontró audio para este video.', m)
        await m.react('❌')
      }
      return
    }

    if (videoUrl) {
      const buttons = [
        {
          buttonId: `fb_video_${encodeURIComponent(videoUrl)}`,
          buttonText: { displayText: '📹 Video' },
          type: 1
        },
        {
          buttonId: `fb_audio_${encodeURIComponent(args[0])}`,
          buttonText: { displayText: '🎵 Audio' },
          type: 1
        }
      ]

      const buttonMessage = {
        text: `🐉 *GOHAN BEAST — FACEBOOK* 🐉

✅ Video encontrado guerrero.

📹 *Título:* ${title}

📹 *Opciones:*
➤ Toca "Video" para descargar el video
➤ Toca "Audio" para descargar solo el audio

⚡ ¿Qué deseas hacer?`,
        footer: 'Gohan Beast - Poder Máximo Activado',
        buttons: buttons,
        headerType: 1
      }

      await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
      
      await conn.sendFile(
        m.chat,
        videoUrl,
        'facebook.mp4',
        `🐉 *GOHAN BEAST — FACEBOOK* 🐉

✅ Aquí tienes tu video guerrero.

📹 *Título:* ${title}
⚡ Poder Máximo Activado`,
        m
      )

      if (m.react) await m.react('✅')
    }

  } catch (error) {
    if (m.react) await m.react('❌')
    await m.reply(`🐉 *GOHAN BEAST* 🐉\n\n❌ Error: ${error.message}`)
  }
}

handler.before = async (m, { conn }) => {
  try {
    if (!m.message?.buttonsResponseMessage) return false
    
    const response = m.message.buttonsResponseMessage
    const text = response.selectedButtonId || ''
    
    if (text.startsWith('fb_video_')) {
      const url = decodeURIComponent(text.replace('fb_video_', ''))
      await conn.sendFile(
        m.chat,
        url,
        'facebook.mp4',
        '🐉 *GOHAN BEAST — FACEBOOK* 🐉\n\n✅ Aquí tienes tu video guerrero.\n\n⚡ Poder Máximo Activado',
        m
      )
      await m.react('✅')
      return true
    }
    
    if (text.startsWith('fb_audio_')) {
      const url = decodeURIComponent(text.replace('fb_audio_', ''))
      
      try {
        const api = `https://yosoyyo-api-ofc.onrender.com/api/facebook?url=${encodeURIComponent(url)}&apiKey=free_key`
        const res = await fetch(api)
        const json = await res.json()
        
        if (json?.result?.audio_url) {
          await conn.sendFile(
            m.chat,
            json.result.audio_url,
            'facebook-audio.mp3',
            `🐉 *GOHAN BEAST — FACEBOOK AUDIO* 🐉

✅ Aquí tienes tu audio guerrero.

🎵 *Título:* ${json.result.title || 'Facebook Audio'}
🎵 *Formato:* MP3
⚡ Poder Máximo Activado`,
            m
          )
          await m.react('✅')
        } else {
          await conn.reply(m.chat, '🐉 *GOHAN BEAST* 🐉\n\n❌ No se encontró audio para este video.', m)
          await m.react('❌')
        }
      } catch (e) {
        await conn.reply(m.chat, '🐉 *GOHAN BEAST* 🐉\n\n❌ Error al obtener el audio.', m)
        await m.react('❌')
      }
      return true
    }
    
    return false
  } catch (e) {
    console.log('Error en botones FB:', e.message)
    return false
  }
}

handler.command = ['facebook', 'fb', 'fbaudio', 'facebookaudio', 'gohanfb']
handler.tags = ['descargas']
handler.help = ['facebook', 'fb', 'fbaudio']

export default handler