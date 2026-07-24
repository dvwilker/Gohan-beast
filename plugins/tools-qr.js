import qrcode from 'qrcode'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — GENERADOR QR

⚡ Para generar un código QR usa:
.qr <texto o enlace>

📌 Ejemplo:
.qr https://github.com/dvwilker/Gohan-Beast

📌 También puedes generar texto:
.qr Hola guerrero!
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    
    const qrBuffer = await qrcode.toBuffer(text, {
      type: 'png',
      margin: 2,
      width: 500,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    await conn.sendMessage(m.chat, {
      image: qrBuffer,
      caption: `
🐉 GOHAN BEAST — CÓDIGO QR

✅ QR generado exitosamente

📌 *Contenido:*
${text}

⚡ Escanea con tu cámara
      `.trim()
    }, { quoted: m })
    
    await m.react('✅')
  } catch (error) {
    console.error('Error al generar QR:', error)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR

❌ No se pudo generar el código QR

💡 Asegúrate de que el texto sea válido
    `.trim(), m)
    await m.react('❌')
  }
}

handler.command = ['qrt', 'qrtcode']
handler.tags = ['tools']
handler.help = ['qrt <texto/enlace>']

export default handler