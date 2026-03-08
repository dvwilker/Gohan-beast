async function handler(m, { conn, args, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const type = 'coin'
  const bankType = 'bank'
  const moneda = global.moneda || '¥'
  const icoMoney = '💰'
  const icoWarning = '⚠️'
  const icoSuccess = '✅'

  if (!args[0] || !args[1]) {
    const helpMsg = `⚡ *GOHAN BESTIA - TRANSFERENCIA DE KI* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n\n${icoWarning} *Falta información de poder*\n\nUsa: *${usedPrefix + command} <cantidad> @usuario*\nEjemplo: *${usedPrefix + command} 25000 @miguez*\n\n🌀 ¡Comparte tu energía con otros guerreros! 🌀`
    return conn.sendMessage(m.chat, { text: helpMsg, mentions: [m.sender], ...global.rcanal }, { quoted: m })
  }

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(100, isNumber(args[0]) ? parseInt(args[0]) : 100))
  const who = m.mentionedJid?.[0] || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : '')

  if (!who) {
    return conn.sendMessage(m.chat, {
      text: `⚡ *GOHAN BESTIA - ERROR DE PODER* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n\n${icoWarning} Debes transferir al menos *100 ${moneda}* de ki y mencionar al guerrero.\n\n💫 ¡Hazlo bien, Bestia!`,
      mentions: [m.sender],
      ...global.rcanal
    }, { quoted: m })
  }

  if (!(who in global.db.data.users)) {
    return conn.sendMessage(m.chat, {
      text: `⚡ *GOHAN BESTIA - GUERRERO NO REGISTRADO* ⚡\n\n🦾 Bestia: @${m.sender.split('@')[0]}\n🎯 Destino: @${who.split('@')[0]}\n\n${icoWarning} Este guerrero *${who.split('@')[0]}* no tiene ki registrado en la base de datos.\n\n💢 ¡Necesita despertar su poder primero!`,
      mentions: [m.sender],
      ...global.rcanal
    }, { quoted: m })
  }

  if (user[bankType] < count) {
    return conn.sendMessage(m.chat, {
      text: `⚡ *GOHAN BESTIA - KI INSUFICIENTE* ⚡\n\n🦾 Bestia: @${m.sender.split('@')[0]}\n\n${icoWarning} No tienes suficiente ki (${moneda}) en tu banco para transferir.\n\n💫 Necesitas: *${moneda}${count.toLocaleString()}*\n✨ Tienes: *${moneda}${user[bankType].toLocaleString()}*\n\n🌀 ¡Guarda más poder en tu banco, Saiyan!`,
      mentions: [m.sender],
      ...global.rcanal
    }, { quoted: m })
  }

  user[bankType] -= count
  global.db.data.users[who][type] += count

  const bancoActual = user[bankType].toLocaleString()
  const nombre = await conn.getName(who)
  const mención = '@' + who.split('@')[0]

  const mensaje = `
🦾 *GOHAN BESTIA - TRANSFERENCIA DE PODER EXITOSA* 🦾

⚡ *Bestia donante:* @${m.sender.split('@')[0]}
💫 *Guerrero receptor:* ${nombre} ${mención}

💰 *Ki transferido:* *${moneda}${count.toLocaleString()}*
✨ *Ki restante en banco:* *${moneda}${bancoActual}*

🌀 ¡EL PODER DE GOHAN BESTIA SE COMPARTE ENTRE GUERREROS! 🌀
💥 ¡SIGUE ACUMULANDO KI, SAIYAN! 💥
  `.trim()

  return conn.sendMessage(m.chat, { text: mensaje, mentions: [who, m.sender], ...global.rcanal }, { quoted: m })
}

handler.help = ['pay']
handler.tags = ['eco']
handler.command = ['pay', 'transferir', 'transferirki', 'donarki']
handler.group = false
handler.register = false

export default handler

function isNumber(x) {
  return !isNaN(x)
}