import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero. Usa .reg nombre.edad', m)
  }

  const cooldown = getCooldown(userId, 'work')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a trabajar.`, m)
  }

  const trabajos = [
    { nombre: 'Programador', pago: 500, emoji: '💻' },
    { nombre: 'Constructor', pago: 400, emoji: '🏗️' },
    { nombre: 'Cocinero', pago: 350, emoji: '👨‍🍳' },
    { nombre: 'Mecánico', pago: 450, emoji: '🔧' },
    { nombre: 'Pescador', pago: 300, emoji: '🎣' },
    { nombre: 'Cazador', pago: 380, emoji: '🏹' },
    { nombre: 'Minero', pago: 420, emoji: '⛏️' },
    { nombre: 'Granjero', pago: 320, emoji: '🌾' },
    { nombre: 'Carpintero', pago: 370, emoji: '🪚' },
    { nombre: 'Panadero', pago: 330, emoji: '🍞' }
  ]

  const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
  const bonus = trabajo.pago + Math.floor(Math.random() * 200)
  const expGanada = Math.floor(Math.random() * 50) + 10

  user.coins += bonus
  user.exp += expGanada
  user.lastWork = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — TRABAJO

${trabajo.emoji} Has trabajado como *${trabajo.nombre}*

💰 +${formatNumber(bonus)} ${global.coin}
⚡ +${expGanada} XP
💎 Total: ${formatNumber(user.coins)} ${global.coin}

🔄 Vuelve en 1 hora
    `.trim(), m)
  await m.react('💼')
}

handler.command = ['work', 'trabajar']
handler.tags = ['economy']
handler.help = ['work']

export default handler