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

    const api = `https://api.mediafire.com/api/1.5/file/get_info.php?recursive=1&file_id=${extractFileId(text)}&response_format=json`
    const res = await axios.get(api)
    const data = res.data.response

    if (!data.file_info) {
      return conn.reply(m.chat, '❌ No se pudo obtener la información del archivo.', m)
    }

    const fileInfo = data.file_info
    const fileName = fileInfo.filename
    const fileSize = (fileInfo.size / 1024 / 1024).toFixed(2)
    
    const info = `
🐉 GOHAN BEAST — MEDIA FIRE

📌 *Nombre:* ${fileName}
📦 *Tamaño:* ${fileSize} MB
📁 *Tipo:* ${fileInfo.filetype || 'Desconocido'}

⚡ Descargando archivo...
    `.trim()

    await conn.reply(m.chat, info, m)

    const downloadApi = `https://api.mediafire.com/api/1.5/file/get_links.php?recursive=1&file_id=${extractFileId(text)}&response_format=json`
    const downloadRes = await axios.get(downloadApi)
    const downloadData = downloadRes.data.response

    if (downloadData.links && downloadData.links.length > 0) {
      const link = downloadData.links[0].url

      const fileBuffer = await axios.get(link, { responseType: 'arraybuffer' })
      
      await conn.sendMessage(m.chat, {
        document: fileBuffer.data,
        mimetype: 'application/octet-stream',
        fileName: fileName,
        caption: `
🐉 GOHAN BEAST — MEDIA FIRE

✅ Archivo descargado exitosamente

📌 *Nombre:* ${fileName}
📦 *Tamaño:* ${fileSize} MB

⚡ *Gohan Beast - Poder Máximo Activado*
        `.trim()
      }, { quoted: m })
      await m.react('✅')
    } else {
      await conn.reply(m.chat, '❌ No se pudo obtener el enlace de descarga.', m)
      await m.react('❌')
    }
  } catch (e) {
    console.error('Error en MediaFire:', e)
    await conn.reply(m.chat, '❌ Error al descargar el archivo de MediaFire. Verifica que el enlace sea válido.', m)
    await m.react('❌')
  }
}

function extractFileId(url) {
  const match = url.match(/file\/([a-zA-Z0-9]+)/i)
  return match ? match[1] : url.split('/').pop()
}

handler.command = ['mf', 'mediafire', 'media']
handler.tags = ['descargas']
handler.help = ['mf <url>']

export default handler