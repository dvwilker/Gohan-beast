const ro = 300 // Gohan Bestia roba cantidades más grandes

const handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const cooldown = 2 * 60 * 60 * 1000
  const nextRob = user.lastrob2 + cooldown

  if (Date.now() < nextRob) return conn.reply(
    m.chat,
    `
⚡ *GOHAN BESTIA - KI RECARGANDO* ⚡

🦾 Guerrero: @${m.sender.split`@`[0]}

⏳ Tiempo para recuperar energía: *${msToTime(nextRob - Date.now())}*
    `.trim(),
    m,
    { mentions: [m.sender], ...global.rcanal }
  )

  let who = m.isGroup ? m.mentionedJid?.[0] || m.quoted?.sender : m.chat

  if (!who) return conn.reply(
    m.chat,
    `
🔥 *GOHAN BESTIA - ERROR DE COMBATE* 🔥

🦾 Saiyan: @${m.sender.split`@`[0]}

⚠️ ¡Debes señalar a tu oponente para atacar!
    `.trim(),
    m,
    { mentions: [m.sender], ...global.rcanal }
  )

  if (!(who in global.db.data.users)) return conn.reply(
    m.chat,
    `
❄️ *GOHAN BESTIA - OPONENTE DÉBIL* ❄️

🦾 Guerrero: @${m.sender.split`@`[0]}

💤 Este guerrero no tiene poder ki que robar
    `.trim(),
    m,
    { mentions: [m.sender], ...global.rcanal }
  )

  const target = global.db.data.users[who]
  const robAmount = Math.floor(Math.random() * ro) + 50 // Bonus inicial

  if (target.coin < robAmount) return conn.reply(
    m.chat,
    `
💢 *GOHAN BESTIA - OPONENTE SIN ENERGÍA* 💢

🦾 Bestia: @${m.sender.split`@`[0]}
🎯 Víctima: @${who.split`@`[0]}

💫 ¡No tiene suficiente ki! Necesita *${robAmount} zeni* para un buen combate
    `.trim(),
    m,
    { mentions: [m.sender, who], ...global.rcanal }
  )

  user.coin += robAmount
  target.coin -= robAmount
  user.lastrob2 = Date.now()

  return conn.reply(
    m.chat,
    `
⚡ *GOHAN BESTIA - ATAQUE BESTIAL* ⚡

🦾 Bestia: @${m.sender.split`@`[0]}
💢 Oponente: @${who.split`@`[0]}

💥 ¡Poder robado: *${robAmount} zeni*!
🌀 ¡NADIE DETIENE A GOHAN BESTIA! 🌀
  `.trim(),
    m,
    { mentions: [m.sender, who], ...global.rcanal }
  )
}

handler.help = ['robar']
handler.tags = ['eco']
handler.command = ['robar', 'steal', 'rob', 'ataquebestia']
handler.group = false
handler.register = false

export default handler

function msToTime(duration) {
  let s = Math.floor((duration / 1000) % 60)
  let m = Math.floor((duration / (1000 * 60)) % 60)
  let h = Math.floor(duration / (1000 * 60 * 60))

  h = h < 10 ? '0' + h : h
  m = m < 10 ? '0' + m : m
  s = s < 10 ? '0' + s : s

  return `${h}h ${m}m ${s}s`
}