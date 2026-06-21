// plugins/pay.js
import { getUser, updateUser, formatNumber } from './economy.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  if (!text) {
    return conn.reply(m.chat, '📌 Usa: .pay @usuario <cantidad>', m)
  }

  const parts = text.split(' ')
  if (parts.length < 2) {
    return conn.reply(m.chat, '📌 Usa: .pay @usuario <cantidad>', m)
  }

  const target = parts[0].replace(/[@+]/g, '').trim() + '@s.whatsapp.net'
  const amount = parseInt(parts[1])

  if (isNaN(amount) || amount <= 0) {
    return conn.reply(m.chat, '❌ Cantidad inválida.', m)
  }

  if (target === userId) {
    return conn.reply(m.chat, '❌ No puedes pagarte a ti mismo.', m)
  }

  const targetUser = getUser(target)
  if (!targetUser.registered) {
    return conn.reply(m.chat, '❌ El usuario no está registrado.', m)
  }

  if (amount > user.coins) {
    return conn.reply(m.chat, `❌ No tienes suficientes coins. Tienes ${formatNumber(user.coins)} ${global.coin}`, m)
  }

  user.coins -= amount
  targetUser.coins += amount
  updateUser(userId, user)
  updateUser(target, targetUser)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — PAGO

✅ Has pagado ${formatNumber(amount)} ${global.coin} a @${target.split('@')[0]}

💰 Tu total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m, { mentions: [target] })
  await m.react('💸')
}

handler.command = ['pay', 'pagar']
handler.tags = ['economy']
handler.help = ['pay @usuario <cantidad>']

export default handler