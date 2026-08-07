const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const senderId = msg.key.participant || msg.key.remoteJid

  await conn.sendMessage(chatId, {
    react: { text: '🛰️', key: msg.key }
  })

  const context = msg.message?.extendedTextMessage?.contextInfo
  const citado = context?.participant
  const objetivo = citado || senderId

  const esLID = objetivo.includes('@lid')
  const tipo = esLID ? 'LID oculto (@lid)' : 'Número visible (@s.whatsapp.net)'

  let numeroReal = objetivo.replace(/[^0-9]/g, '')
  let nombre = 'Desconocido'

  try {
    nombre = await conn.getName(objetivo)
  } catch {}

  const mensaje = `
🐉 GOHAN BEAST — INFORMACIÓN DE USUARIO

👤 *Nombre:* ${nombre}
🆔 *ID:* ${objetivo}
📱 *Número:* ${numeroReal}
🔐 *Tipo de cuenta:* ${tipo}

⚡ Gohan Beast - Poder Máximo Activado
`.trim()

  await conn.sendMessage(chatId, {
    text: mensaje
  }, { quoted: msg })
}

handler.command = ['lid', 'info', 'userinfo']
handler.group = true
handler.private = false

export default handler