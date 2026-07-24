import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'fish')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a pescar.`, m)
  }

  const peces = [
    { nombre: 'Salmón', pago: 200, emoji: '🐟' },
    { nombre: 'Trucha', pago: 180, emoji: '🎣' },
    { nombre: 'Atún', pago: 250, emoji: '🐠' },
    { nombre: 'Pez Espada', pago: 300, emoji: '🐡' },
    { nombre: 'Dorado', pago: 220, emoji: '🐠' },
    { nombre: 'Tiburón', pago: 400, emoji: '🦈' },
    { nombre: 'Pulpo', pago: 280, emoji: '🐙' },
    { nombre: 'Calamar', pago: 150, emoji: '🦑' }
  ]

  const random = Math.random()
  let pez = peces[Math.floor(Math.random() * peces.length)]
  let bonus = pez.pago + Math.floor(Math.random() * 80)

  if (random < 0.15) {
    const perdido = Math.floor(Math.random() * 80) + 10
    user.coins -= perdido
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — PESCA FALLIDA

${pez.emoji} El ${pez.nombre} rompió la línea!

💸 Perdiste ${formatNumber(perdido)} ${global.coin}
    `.trim(), m)
  } else {
    user.coins += bonus
    const expGanada = Math.floor(Math.random() * 20) + 8
    user.exp += expGanada
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — PESCA EXITOSA

${pez.emoji} Has pescado un ${pez.nombre}!

💰 +${formatNumber(bonus)} ${global.coin}
⚡ +${expGanada} XP
💎 Total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  }

  user.lastFish = Date.now()
  updateUser(userId, user)
  await m.react('🎣')
}

handler.command = ['fish', 'pescar']
handler.tags = ['economy']
handler.help = ['fish']

export default handler