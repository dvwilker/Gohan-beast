import { getUser, formatNumber } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — BANCO

🏦 Tu dinero en el banco:

${formatNumber(user.bank)} ${global.coin}

💰 Coins: ${formatNumber(user.coins)} ${global.coin}
💎 Total: ${formatNumber(user.coins + user.bank)} ${global.coin}
    `.trim(), m)
  await m.react('🏦')
}

handler.command = ['ball', 'banco']
handler.tags = ['economy']
handler.help = ['ball']

export default handler