import { getUser, updateUser, getCooldown, formatTime, formatNumber } from './economy.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'run')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a correr.`, m)
  }

  const bonus = Math.floor(Math.random() * (global.runCoins.max - global.runCoins.min + 1)) + global.runCoins.min
  user.coins += bonus
  user.lastRun = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — CORRER

🏃 Has corrido y encontrado:

💰 +${formatNumber(bonus)} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}

🔄 Vuelve en 1 minuto
    `.trim(), m)
  await m.react('🏃')
}

handler.command = ['run', 'correr']
handler.tags = ['economy']
handler.help = ['run']

export default handler