let handler = async (m, { conn, args, participants }) => {
  let moneda = global.moneda || '💸'
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    coin: data.coin || 0,
    bank: data.bank || 0
  }))

  let sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))

  let count = 10
  if (args[0]) {
    let n = parseInt(args[0])
    if (!isNaN(n)) count = Math.min(Math.max(n, 1), 10)
  }
  if (count > sorted.length) count = sorted.length

  let text = `🦾 *GOHAN BESTIA - TOP GUERREROS MÁS PODEROSOS* 🦾\n\n`
  text += `⚡ *Ranking de Ki (${moneda}) acumulado:*\n━━━━━━━━━━━━━━━━━━\n\n`

  let mentions = []

  for (let i = 0; i < count; i++) {
    let user = sorted[i]
    let total = user.coin + user.bank
    let inGroup = participants.some(p => p.jid === user.jid)
    let displayName = inGroup ? await conn.getName(user.jid) : user.jid.split('@')[0]

    mentions.push(user.jid)

    // DIFERENTES ICONOS SEGÚN EL PUESTO
    let icon = ''
    if (i === 0) icon = '👑 ' // Rey
    else if (i === 1) icon = '⚡ ' // Segundo
    else if (i === 2) icon = '💫 ' // Tercero
    else icon = '🌀 '

    // BARRA DE PODER VISUAL
    let powerBar = getPowerBar(total)
    
    text += `${icon} *${i + 1}. @${user.jid.split('@')[0]}*\n`
    text += `   └ ✨ Ki Total: *${total.toLocaleString()} ${moneda}*\n`
    text += `   └ 💰 Cartera: *${user.coin.toLocaleString()} ${moneda}*\n`
    text += `   └ 🏦 Banco: *${user.bank.toLocaleString()} ${moneda}*\n`
    text += `   └ ⚡ Poder: ${powerBar}\n\n`
  }

  text += `━━━━━━━━━━━━━━━━━━\n`
  text += `🌀 *¡QUE EL PODER BESTIA TE ACOMPAÑE!* 🌀\n`
  text += `💥 *ENTRENA DURO PARA SUBIR EN EL RANKING* 💥`

  await conn.reply(m.chat, text.trim(), m, { mentions })
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard', 'topki', 'rankingbestia']
handler.group = false
handler.register = false

export default handler

// FUNCIÓN PARA CREAR BARRA DE PODER VISUAL
function getPowerBar(total) {
  let maxPower = 1000000 // 1 millón como referencia máxima
  let percentage = Math.min(Math.floor((total / maxPower) * 10), 10)
  
  let filledBars = '█'.repeat(percentage)
  let emptyBars = '░'.repeat(10 - percentage)
  
  return `[${filledBars}${emptyBars}] ${percentage * 10}%`
}