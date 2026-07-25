import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — MEDIA FIRE

⚡ Descarga archivos de MediaFire.

📌 Uso: .mf <url>
📌 Ejemplo: .mf https://www.mediafire.com/file/xxx/file.zip

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
  }

  if (!text.match(/mediafire\.com/i)) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR

❌ El enlace no es de MediaFire.

📌 Ejemplo: .mf https://www.mediafire.com/file/xxx/file.zip
    `.trim(), m)
  }

  try {
    await m.react('⏳')

    const api = `https://api.davidcyriltech.my.id/mediafire?url=${encodeURIComponent(text)}`
    const res = await axios.get(api)
    const data = res.data

    if (!data.status || !data.result) {
      return conn.reply(m.chat, '❌ No se pudo obtener la información del archivo.', m)
    }

    const fileInfo = data.result
    const fileName = fileInfo.filename || 'archivo'
    const fileSize = fileInfo.filesize || 'Desconocido'
    const downloadUrl = fileInfo.url || fileInfo.download

    if (!downloadUrl) {
      return conn.reply(m.chat, '❌ No se encontró enlace de descarga.', m)
    }

    const info = `
🐉 GOHAN BEAST — MEDIA FIRE

📌 *Nombre:* ${fileName}
📦 *Tamaño:* ${fileSize}
📁 *Tipo:* ${fileInfo.filetype || 'Desconocido'}

⚡ Descargando archivo...
    `.trim()

    await conn.reply(m.chat, info, m)

    const fileBuffer = await axios.get(downloadUrl, { 
      responseType: 'arraybuffer',
      timeout: 30000
    })
    
    await conn.sendMessage(m.chat, {
      document: fileBuffer.data,
      mimetype: 'application/octet-stream',
      fileName: fileName,
      caption: `
🐉 GOHAN BEAST — MEDIA FIRE

✅ Archivo descargado exitosamente

📌 *Nombre:* ${fileName}
📦 *Tamaño:* ${fileSize}

⚡ *Gohan Beast - Poder Máximo Activado*
      `.trim()
    }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error('Error en MediaFire:', e)
    await conn.reply(m.chat, '❌ Error al descargar el archivo. Verifica que el enlace sea válido o intenta con otro.', m)
    await m.react('❌')
  }
}

handler.command = ['mf', 'mediafire', 'media']
handler.tags = ['descargas']
handler.help = ['mf <url>']

export default handler