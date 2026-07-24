import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'mine')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a minar.`, m)
  }

  const bonus = Math.floor(Math.random() * (global.mineCoins.max - global.mineCoins.min + 1)) + global.mineCoins.min
  user.coins += bonus
  user.lastMine = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — MINA

⛏️ Has minado y encontrado:

💰 +${formatNumber(bonus)} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}

🔄 Vuelve en 1 minuto
    `.trim(), m)
  await m.react('⛏️')
}

handler.command = ['mine']
handler.tags = ['economy']
handler.help = ['mine']

export default handler