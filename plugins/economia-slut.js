import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'slut')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a usar .slut.`, m)
  }

  const bonus = Math.floor(Math.random() * (global.slutCoins.max - global.slutCoins.min + 1)) + global.slutCoins.min
  user.coins += bonus
  user.lastSlut = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — SLUT

🔥 Has conseguido:

💰 +${formatNumber(bonus)} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}

🔄 Vuelve en 1 minuto
    `.trim(), m)
  await m.react('🔥')
}

handler.command = ['slut']
handler.tags = ['economy']
handler.help = ['slut']

export default handler