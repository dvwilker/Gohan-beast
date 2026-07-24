import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero. Usa .reg nombre.edad', m)
  }

  const cooldown = getCooldown(userId, 'daily')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para reclamar tu daily.`, m)
  }

  const bonus = global.dailyCoins
  user.coins += bonus
  user.lastDaily = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — DAILY

✅ ¡Has reclamado tu recompensa diaria!

💰 +${formatNumber(bonus)} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}

🔄 Vuelve en 24 horas
    `.trim(), m)
  await m.react('💎')
}

handler.command = ['daily']
handler.tags = ['economy']
handler.help = ['daily']

export default handler