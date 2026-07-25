let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
  }

  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ACCESO DENEGADO

⚡ Solo los administradores o el dueño pueden expulsar usuarios.

🗡️ *Poder insuficiente guerrero.*
    `.trim(), m)
  }

  const quoted = m.quoted
  if (!quoted) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — EXPULSAR USUARIO

📌 Responde al mensaje del usuario que quieres expulsar con:
.kick

📌 *Ejemplo:*
1. Busca un mensaje del usuario
2. Responde a su mensaje
3. Escribe .kick

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
  }

  const userToKick = quoted.sender
  if (!userToKick) {
    return conn.reply(m.chat, '❌ No se pudo identificar al usuario.', m)
  }

  if (userToKick === conn.user.jid) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR DIVINO

❌ No puedo expulsarme a mí mismo.

⚡ *El poder del dragón no se vuelve contra sí mismo.*
    `.trim(), m)
  }

  if (userToKick === m.sender) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR DIVINO

❌ No puedes expulsarte a ti mismo.

⚡ *El poder no se usa contra el propio guerrero.*
    `.trim(), m)
  }

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants
  
  const userIsAdmin = participants.find(p => p.id === userToKick)?.admin === 'admin' || 
                      participants.find(p => p.id === userToKick)?.admin === 'superadmin'
  
  if (userIsAdmin) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR DIVINO

❌ No puedo expulsar a un administrador.

⚡ *Su poder es demasiado grande.*
    `.trim(), m)
  }

  const botIsAdmin = participants.find(p => p.id === conn.user.jid)?.admin === 'admin' || 
                     participants.find(p => p.id === conn.user.jid)?.admin === 'superadmin'

  if (!botIsAdmin) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR DIVINO

❌ Necesito ser administrador para expulsar usuarios.

⚡ *Dame el poder de administrador.*
    `.trim(), m)
  }

  try {
    await m.react('⏳')
    await conn.groupParticipantsUpdate(m.chat, [userToKick], 'remove')
    
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — EXPULSIÓN DIVINA

🗡️ @${userToKick.split('@')[0]} ha sido expulsado del grupo.

👤 *Ejecutado por:* @${m.sender.split('@')[0]}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m, { mentions: [userToKick, m.sender] })
    await m.react('🗡️')
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — ERROR

❌ No se pudo expulsar al usuario.

💡 Verifica que el usuario aún esté en el grupo.
    `.trim(), m)
    await m.react('❌')
  }
}

handler.command = ['kick', 'expulsar', 'echar']
handler.tags = ['group']
handler.help = ['kick (respondiendo a un mensaje)']
handler.group = true
handler.admin = true

export default handler