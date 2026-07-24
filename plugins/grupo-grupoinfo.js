let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)
  }

  const group = await conn.groupMetadata(m.chat)
  const members = participants.map(v => v.id)
  const admins = participants.filter(v => v.admin).map(v => v.id)
  
  const total = members.length
  const totalAdmins = admins.length
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — INFORMACIÓN DEL GRUPO

📌 *Nombre:* ${group.subject}
🆔 *ID:* ${m.chat}
👤 *Creador:* ${group.owner ? '@' + group.owner.split('@')[0] : 'Desconocido'}
👥 *Miembros:* ${total}
👑 *Administradores:* ${totalAdmins}
📅 *Creado:* ${new Date(group.creation * 1000).toLocaleDateString()}

👑 *Administradores:*
${admins.map(v => '┃ ➩ @' + v.split('@')[0]).join('\n')}

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m, { mentions: [...admins, group.owner] })
  await m.react('🏠')
}

handler.command = ['groupinfo', 'info grupo']
handler.tags = ['group']
handler.help = ['groupinfo']

export default handler