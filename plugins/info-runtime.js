let handler = async (m, { conn }) => {
  const uptime = process.uptime()
  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  const seconds = Math.floor(uptime % 60)
  
  const startDate = new Date(Date.now() - uptime * 1000)
  
  await conn.reply(m.chat, `
🐉 *GOHAN BEAST — TIEMPO ACTIVO* 🐉

╔═══════════════════════════════════╗
║  ⏱️ *Tiempo activo:*
║
║  ${days > 0 ? `📆 ${days} días` : ''}
║  🕐 ${hours}h ${minutes}m ${seconds}s
║
║  📅 *Iniciado:* ${startDate.toLocaleString()}
║  🟢 *Estado:* Activo
╚═══════════════════════════════════╝

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('⏱️')
}

handler.command = ['runtime', 'uptime', 'activo']
handler.tags = ['info']
handler.help = ['runtime']

export default handler