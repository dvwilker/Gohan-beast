import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — INFORMACIÓN DE TELÉFONO

⚡ Muestra información de un número telefónico.

📌 Uso: .phone <número>
📌 Ejemplo: .phone 5492644138998
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    const res = await axios.get(`https://api.agatz.xyz/api/phoneinfo?number=${text}`)
    const data = res.data

    if (!data.status || !data.data) {
      return conn.reply(m.chat, '❌ Número no válido.', m)
    }

    const info = data.data

    await conn.reply(m.chat, `
🐉 GOHAN BEAST — INFORMACIÓN DE TELÉFONO

📱 Número: ${info.number || text}
🌍 País: ${info.country || 'N/A'}
📌 Código: ${info.countryCode || 'N/A'}
📍 Región: ${info.region || 'N/A'}
📞 Operador: ${info.carrier || 'N/A'}
✅ Válido: ${info.valid ? '✅ Sí' : '❌ No'}

⚡ Gohan Beast - Poder Máximo Activado
    `.trim(), m)
    await m.react('✅')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al obtener la información.', m)
    await m.react('❌')
  }
}

handler.command = ['phone', 'telefono', 'numero']
handler.tags = ['tools']
handler.help = ['phone <número>']

export default handler