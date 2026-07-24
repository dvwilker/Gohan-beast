import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'hunt')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a cazar.`, m)
  }

  const presas = [
    { nombre: 'Ciervo', pago: 250, emoji: '🦌' },
    { nombre: 'Jabalí', pago: 300, emoji: '🐗' },
    { nombre: 'Lobo', pago: 400, emoji: '🐺' },
    { nombre: 'Oso', pago: 500, emoji: '🐻' },
    { nombre: 'Conejo', pago: 150, emoji: '🐇' },
    { nombre: 'Zorro', pago: 200, emoji: '🦊' },
    { nombre: 'Águila', pago: 350, emoji: '🦅' },
    { nombre: 'Serpiente', pago: 180, emoji: '🐍' }
  ]

  const random = Math.random()
  let presa = presas[Math.floor(Math.random() * presas.length)]
  let bonus = presa.pago + Math.floor(Math.random() * 100)

  if (random < 0.2) {
    const perdido = Math.floor(Math.random() * 100) + 20
    user.coins -= perdido
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — CAZA FALLIDA

${presa.emoji} Intentaste cazar un ${presa.nombre} pero escapó!

💸 Perdiste ${formatNumber(perdido)} ${global.coin}
    `.trim(), m)
  } else {
    user.coins += bonus
    const expGanada = Math.floor(Math.random() * 30) + 10
    user.exp += expGanada
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — CAZA EXITOSA

${presa.emoji} Has cazado un ${presa.nombre}!

💰 +${formatNumber(bonus)} ${global.coin}
⚡ +${expGanada} XP
💎 Total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  }

  user.lastHunt = Date.now()
  updateUser(userId, user)
  await m.react('🏹')
}

handler.command = ['hunt', 'cazar']
handler.tags = ['economy']
handler.help = ['hunt']

export default handler