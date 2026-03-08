var handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let now = Date.now()
  let cooldown = 2 * 60 * 60 * 1000
  let nextClaim = (user.lastclaim || 0) + cooldown

  if (now < nextClaim) {
    let wait = msToTime(nextClaim - now)
    return conn.reply(
      m.chat,
      `⚡ *GOHAN BESTIA - KI DIARIO AGOTADO* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n\n⏳ Tu poder Bestia se recarga en: *${wait}*\n\n🌀 ¡Vuelve cuando tu ki esté listo!`,
      m,
      { mentions: [m.sender], ...global.rcanal }
    )
  }

  // GOHAN BESTIA - RECOMPENSAS MEJORADAS 🔥
  let coin = Math.floor(Math.random() * 2001) + 500 // Antes 100-500
  let exp = Math.floor(Math.random() * 2001) + 500 // Antes 100-500
  let diamond = Math.floor(Math.random() * 2001) + 500 // Antes 100-500

  user.coin += coin
  user.exp += exp
  user.diamond += diamond
  user.lastclaim = now

  let texto = 
`🦾 *GOHAN BESTIA - RECOMPENSA DIARIA* 🦾

⚡ Guerrero Bestia: @${m.sender.split('@')[0]}

✨ *PODER OBTENIDO:*
━━━━━━━━━━━━━━
💫 *Experiencia Bestia:* *+${exp} XP*
💎 *Esferas del Dragón:* *+${diamond}*
💰 *Zeni Saiyan:* *+${coin}*
━━━━━━━━━━━━━━

🌀 *¡EL PODER DE GOHAN BESTIA CRECE CADA DÍA!* 🌀
💥 *¡VUELVE MAÑANA POR MÁS KI BESTIAL!* 💥`

  await conn.reply(m.chat, texto, m, { mentions: [m.sender], ...global.rcanal })
}

handler.help = ['daily', 'claim']
handler.tags = ['rpg']
handler.command = ['daily', 'diario', 'poderbestia', 'kidiario']
handler.group = false
handler.register = false

export default handler

function msToTime(duration) {
  let hours = Math.floor(duration / (1000 * 60 * 60))
  let minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

  let hDisplay = hours > 0 ? (hours < 10 ? '0' + hours : hours) + ' Horas ' : ''
  let mDisplay = minutes > 0 ? (minutes < 10 ? '0' + minutes : minutes) + ' Minutos' : ''

  return hDisplay + mDisplay
}