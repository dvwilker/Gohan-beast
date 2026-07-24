import { getUser, updateUser, getCooldown, formatTime, formatNumber } from '../economy-system.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero. Usa .reg nombre.edad', m)
  }

  const cooldown = getCooldown(userId, 'rob')
  if (cooldown > 0) {
    return conn.reply(m.chat, `⏳ Espera ${formatTime(cooldown)} para volver a robar.`, m)
  }

  if (!text) {
    return conn.reply(m.chat, '📌 Usa: .rob @usuario', m)
  }

  const target = text.replace(/[@+]/g, '').trim() + '@s.whatsapp.net'
  if (target === userId) {
    return conn.reply(m.chat, '❌ No puedes robarte a ti mismo.', m)
  }

  const targetUser = getUser(target)
  if (!targetUser.registered) {
    return conn.reply(m.chat, '❌ El usuario no está registrado.', m)
  }

  if (targetUser.coins < 100) {
    return conn.reply(m.chat, `❌ ${targetUser.name} tiene menos de 100 ${global.coin}. No vale la pena.`, m)
  }

  const random = Math.random()
  let robado = 0
  
  if (random < 0.4) {
    robado = Math.floor(Math.random() * (targetUser.coins * 0.3)) + 50
    robado = Math.min(robado, 500)
    targetUser.coins -= robado
    user.coins += robado
    updateUser(target, targetUser)
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — ROBO EXITOSO

✅ Has robado ${formatNumber(robado)} ${global.coin} de @${target.split('@')[0]}

💰 Tu total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m, { mentions: [target] })
  } else if (random < 0.7) {
    const perdido = Math.floor(Math.random() * 200) + 50
    user.coins -= perdido
    updateUser(userId, user)
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — ROBO FALLIDO

❌ Intentaste robar pero te atraparon!

💸 Perdiste ${formatNumber(perdido)} ${global.coin}
💰 Tu total: ${formatNumber(user.coins)} ${global.coin}
    `.trim(), m)
  } else {
    await conn.reply(m.chat, `
🐉 GOHAN BEAST — ROBO

😅 Intentaste robar pero no encontraste nada.

¡Sigue intentando!
    `.trim(), m)
  }

  user.lastRob = Date.now()
  updateUser(userId, user)
  await m.react('💰')
}

handler.command = ['rob']
handler.tags = ['economy']
handler.help = ['rob @usuario']

export default handler