import { getUser, updateUser, formatNumber } from './economy.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — DEPOSITAR

📌 Usa:
.dep <cantidad> - Deposita una cantidad
.dep all - Deposita todo

💎 Tus coins: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  }

  let amount
  if (text.toLowerCase() === 'all') {
    amount = user.coins
  } else {
    amount = parseInt(text)
    if (isNaN(amount) || amount <= 0) {
      return conn.reply(m.chat, '❌ Cantidad inválida.', m)
    }
  }

  if (amount > user.coins) {
    return conn.reply(m.chat, `❌ No tienes suficientes coins. Tienes ${formatNumber(user.coins)} ${global.coin}`, m)
  }

  user.coins -= amount
  user.bank += amount
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — DEPÓSITO

✅ Has depositado ${formatNumber(amount)} ${global.coin}

💰 Coins: ${formatNumber(user.coins)} ${global.coin}
🏦 Banco: ${formatNumber(user.bank)} ${global.coin}
    `.trim(), m)
  await m.react('🏦')
}

handler.command = ['dep']
handler.tags = ['economy']
handler.help = ['dep <cantidad/all>']

export default handler