let handler = async (m, { conn, text, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
  }

  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ Solo los administradores pueden expulsar usuarios.', m)
  }

  const user = text.replace(/[@+]/g, '').trim() + '@s.whatsapp.net'
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — EXPULSAR USUARIO

📌 Uso: .kick @usuario
📌 Ejemplo: .kick @usuario
    `.trim(), m)
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — USUARIO EXPULSADO

🗡️ @${user.split('@')[0]} ha sido expulsado del grupo

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m, { mentions: [user] })
    await m.react('🗡️')
  } catch (e) {
    await conn.reply(m.chat, '❌ Error al expulsar al usuario.', m)
    await m.react('❌')
  }
}

handler.command = ['kick', 'expulsar']
handler.tags = ['group']
handler.help = ['kick @usuario']
handler.group = true
handler.admin = true

export default handler