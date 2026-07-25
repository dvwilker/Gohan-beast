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

    const api = `https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(text)}`
    const res = await axios.get(api)
    const data = res.data

    if (!data.status || !data.data) {
      return conn.reply(m.chat, '❌ No se pudo obtener la información del archivo.', m)
    }

    const fileInfo = data.data
    const fileName = fileInfo.nama || 'archivo'
    const fileSize = fileInfo.ukuran || 'Desconocido'
    const downloadUrl = fileInfo.link

    const info = `
🐉 GOHAN BEAST — MEDIA FIRE

📌 *Nombre:* ${fileName}
📦 *Tamaño:* ${fileSize}
📁 *Tipo:* ${fileInfo.tipe || 'Desconocido'}

⚡ Descargando archivo...
    `.trim()

    await conn.reply(m.chat, info, m)

    const fileBuffer = await axios.get(downloadUrl, { responseType: 'arraybuffer' })
    
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
    await conn.reply(m.chat, '❌ Error al descargar el archivo. Verifica que el enlace sea válido.', m)
    await m.react('❌')
  }
}

handler.command = ['mf', 'mediafire', 'media']
handler.tags = ['descargas']
handler.help = ['mf <url>']

export default handler