import { getUser, updateUser, formatNumber } from '../economy-system.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero.', m)
  }

  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — PIEDRA, PAPEL O TIJERA

📌 Usa: .ppt <piedra/papel/tijera> <cantidad>

💎 Ejemplo: .ppt piedra 100
    `.trim(), m)
  }

  const parts = text.split(' ')
  if (parts.length < 2) {
    return conn.reply(m.chat, '📌 Usa: .ppt <piedra/papel/tijera> <cantidad>', m)
  }

  const opciones = ['piedra', 'papel', 'tijera']
  const usuario = parts[0].toLowerCase()
  const amount = parseInt(parts[1])

  if (!opciones.includes(usuario)) {
    return conn.reply(m.chat, '❌ Opción inválida. Usa: piedra, papel o tijera', m)
  }

  if (isNaN(amount) || amount <= 0) {
    return conn.reply(m.chat, '❌ Cantidad inválida.', m)
  }

  if (amount > user.coins) {
    return conn.reply(m.chat, `❌ No tienes suficientes coins. Tienes ${formatNumber(user.coins)} ${global.coin}`, m)
  }

  const bot = opciones[Math.floor(Math.random() * opciones.length)]
  let resultado = ''
  let ganancia = 0

  if (usuario === bot) {
    resultado = '🤝 Empate! Recuperas tu dinero.'
    ganancia = 0
  } else if (
    (usuario === 'piedra' && bot === 'tijera') ||
    (usuario === 'papel' && bot === 'piedra') ||
    (usuario === 'tijera' && bot === 'papel')
  ) {
    resultado = '🎉 Ganaste!'
    ganancia = amount * 2
  } else {
    resultado = '💀 Perdiste!'
    ganancia = -amount
  }

  user.coins += ganancia
  updateUser(userId, user)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — PIEDRA, PAPEL O TIJERA

👤 Tú: ${usuario}
🤖 Bot: ${bot}

${resultado}

💰 ${ganancia >= 0 ? '+' : ''}${formatNumber(ganancia)} ${global.coin}
💎 Total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  await m.react('✂️')
}

handler.command = ['ppt']
handler.tags = ['economy']
handler.help = ['ppt <piedra/papel/tijera> <cantidad>']

export default handler