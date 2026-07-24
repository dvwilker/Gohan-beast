let handler = async (m, { conn, usedPrefix }) => {
  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  
  const totalCommands = Object.keys(global.plugins).length
  const totalUsers = Object.keys(global.db.data.users || {}).length
  const totalGroups = Object.keys(global.db.data.chats || {}).filter(v => v.endsWith('@g.us')).length

  await conn.reply(m.chat, `
🐉 *GOHAN BEAST — INFORMACIÓN DEL BOT* 🐉

╔═══════════════════════════════════╗
║  🤖 *Nombre:* ${global.namebot || 'Gohan Beast'}
║  📌 *Versión:* ${global.vs || '2.2.0'}
║  👑 *Creador:* ${global.author || 'Dvwilker'}
║  ⚡ *Librería:* ${global.libreria || 'Baileys'}
║  🗡️ *Estado:* 🟢 Activo
║
║  ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
║  📦 *Comandos:* ${totalCommands}
║  👥 *Usuarios:* ${totalUsers}
║  🏠 *Grupos:* ${totalGroups}
╚═══════════════════════════════════╝

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('🤖')
}

handler.command = ['botinfo', 'infobot', 'about']
handler.tags = ['info']
handler.help = ['botinfo']

export default handler