import { readUsers, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const users = readUsers()
  
  const sorted = Object.entries(users)
    .filter(([id, data]) => data.registered)
    .map(([id, data]) => ({
      id,
      name: data.name || 'Desconocido',
      total: data.coins + data.bank
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  if (sorted.length === 0) {
    return conn.reply(m.chat, '📭 No hay usuarios registrados.', m)
  }

  const list = sorted.map((user, i) => 
    `┃ ${i + 1}. ${user.name} → ${formatNumber(user.total)} ${global.coin}`
  ).join('\n')

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — TOP USUARIOS

╔═══════════════════════════
${list}
╚═══════════════════════════

👥 Total: ${sorted.length} usuarios
    `.trim(), m)
  await m.react('🏆')
}

handler.command = ['baltop', 'top']
handler.tags = ['economy']
handler.help = ['baltop']

export default handler