import { isLid, isLidConverted, resolveAnyLidToJid, normalizeToPhoneNumber } from '../lid/index.js'

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const senderId = msg.key.participant || msg.key.remoteJid

  // Reacción inicial
  await conn.sendMessage(chatId, {
    react: { text: '🛰️', key: msg.key }
  })

  // Extraer el ID citado o usar el que envió el mensaje
  const context = msg.message?.extendedTextMessage?.contextInfo
  const citado = context?.participant
  const objetivo = citado || senderId

  const esLID = isLid(objetivo)
  const esLIDConvertido = isLidConverted(objetivo)
  const tipo = esLID ? 'LID oculto (@lid)' : esLIDConvertido ? 'LID convertido (número fake)' : 'Número visible (@s.whatsapp.net)'

  // Intentar resolver el número real
  let numeroReal = normalizeToPhoneNumber(objetivo)
  let resolvedJid = null

  try {
    const groupMetadata = conn.chats?.[chatId]?.metadata
    if (groupMetadata?.participants) {
      resolvedJid = resolveAnyLidToJid(objetivo, groupMetadata.participants)
      if (resolvedJid && resolvedJid !== objetivo) {
        numeroReal = normalizeToPhoneNumber(resolvedJid)
      }
    }
  } catch {}

  const numero = objetivo.replace(/[^0-9]/g, '')
  const numeroMostrar = numeroReal || numero

  const mensaje = esLID || esLIDConvertido ? `
📡 *Información del usuario detectado:*

👤 *Identificador:* ${objetivo}
📱 *Número real:* +${numeroMostrar}
🔐 *Tipo de cuenta:* ${tipo}
${resolvedJid && resolvedJid !== objetivo ? `✅ *Resuelto a:* ${resolvedJid}` : ''}
⚠️ *Nota:* Este usuario tiene protección LID activa. El número puede no ser visible públicamente.
`.trim() : `
📡 *Información del usuario detectado:*

👤 *Identificador:* ${objetivo}
📱 *Número:* +${numeroMostrar}
🔐 *Tipo de cuenta:* ${tipo}
`.trim()

  await conn.sendMessage(chatId, {
    text: mensaje
  }, { quoted: msg })
}

handler.command = ['lid']
handler.group = true
handler.private = false

export default handler
