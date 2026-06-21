// plugins/gamble.js
import { getUser, updateUser, getCooldown, formatTime, formatNumber } from './economy.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  const cooldown = getCooldown(userId, 'gamble')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a apostar.`, m)
  }

  if (!text) {
    return conn.reply(m.chat, '📌 Usa: .gamble <cantidad>', m)
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

  const random = Math.random()
  let resultado = ''
  let ganancia = 0

  if (random < 0.1) {
    ganancia = amount * 2.5
    resultado = '🎉 JACKPOT! Ganaste el doble y medio!'
  } else if (random < 0.35) {
    ganancia = amount * 1.5
    resultado = '🎊 Ganaste!'
  } else if (random < 0.6) {
    ganancia = amount * 0.5
    resultado = '😅 Casi, recuperaste la mitad.'
  } else if (random < 0.8) {
    ganancia = -amount * 0.5
    resultado = '💀 Perdiste la mitad.'
  } else {
    ganancia = -amount
    resultado = '💀💀 Perdiste todo!'
  }

  user.coins += Math.floor(ganancia)
  user.lastGamble = Date.now()
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — APUESTA

🎲 Apostaste: ${formatNumber(amount)} ${global.coin}

${resultado}

💰 Resultado: ${ganancia >= 0 ? '+' : ''}${formatNumber(Math.floor(ganancia))} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  await m.react('🎲')
}

handler.command = ['gamble', 'apostar']
handler.tags = ['economy']
handler.help = ['gamble <cantidad/all>']

export default handler