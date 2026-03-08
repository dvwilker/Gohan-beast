import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix }) => {
  let moneda = global.moneda || '💸'
  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  if (who === conn.user.jid) return m.react('✖️')
  if (!(who in global.db.data.users)) return m.reply(`⚡ *GOHAN BESTIA - GUERRERO NO REGISTRADO* ⚡\n\n❌ Este guerrero no existe en la base de datos Saiyan.`)

  let user = global.db.data.users[who]
  let total = (user.coin || 0) + (user.bank || 0)
  let name = await conn.getName(who)

  // CALCULAR NIVEL DE PODER SAIYAN
  let powerLevel = getPowerLevel(total)
  let powerBar = getPowerBar(total)
  let battlePower = calculateBattlePower(user)

  const texto = 
`🦾 *GOHAN BESTIA - MEDICIÓN DE PODER* 🦾

⚡ *Guerrero Saiyan:* ${name} ${who === m.sender ? '(TÚ)' : ''}
━━━━━━━━━━━━━━━━━━

💫 *KI TOTAL:* *${total.toLocaleString()} ${moneda}*
${powerBar}

📊 *DETALLE DE PODER:*
├ 💰 Ki en mano: *${(user.coin || 0).toLocaleString()} ${moneda}*
├ 🏦 Ki protegido: *${(user.bank || 0).toLocaleString()} ${moneda}*
└ ⚡ Poder de batalla: *${battlePower}*

📈 *NIVEL SAIYAN:* *${powerLevel}*

━━━━━━━━━━━━━━━━━━
🌀 *ENTRENA DURO, GUERRERO!* 🌀
💥 Usa *${usedPrefix}deposit* para proteger tu ki de Freezer!
⚠️ *KI DESPROTEGIDO* puede ser robado por enemigos!`

  await conn.reply(m.chat, texto, m, { mentions: [who] })
}

handler.help = ['bal']
handler.tags = ['economía']
handler.command = ['bal', 'balance', 'bank', 'poder', 'ki']
handler.register = false
handler.group = false 

export default handler

// FUNCIÓN PARA CALcular NIVEL DE PODER
function getPowerLevel(total) {
  if (total >= 1000000) return '🟣 SUPER SAIYAN BESTIA LEGENDARIO'
  if (total >= 500000) return '🔵 SUPER SAIYAN BESTIA'
  if (total >= 100000) return '🟡 SUPER SAIYAN 3'
  if (total >= 50000) return '🟡 SUPER SAIYAN 2'
  if (total >= 10000) return '🟡 SUPER SAIYAN'
  if (total >= 5000) return '🟢 GUERRERO ÉLITE'
  if (total >= 1000) return '🟢 GUERRERO EXPERIMENTADO'
  if (total >= 100) return '🟢 NOVATO SAIYAN'
  return '⚪ APRENDIZ'
}

// FUNCIÓN PARA CREAR BARRA DE PODER
function getPowerBar(total) {
  let maxPower = 1000000 // 1 millón como referencia máxima
  let percentage = Math.min(Math.floor((total / maxPower) * 10), 10)
  
  let filledBars = '█'.repeat(percentage)
  let emptyBars = '░'.repeat(10 - percentage)
  
  return `   └ ⚡ [${filledBars}${emptyBars}] ${percentage * 10}% de poder Bestia`
}

// FUNCIÓN PARA CALCULAR PODER DE BATALLA (basado en stats)
function calculateBattlePower(user) {
  let basePower = Math.floor((user.coin + user.bank) / 1000)
  
  // BONUS POR TENER RECURSOS
  let bonus = 0
  if (user.diamond > 100) bonus += 500
  if (user.emerald > 50) bonus += 300
  if (user.gold > 100) bonus += 200
  if (user.iron > 500) bonus += 100
  
  let battlePower = basePower + bonus
  
  if (battlePower > 10000) return '🌪️ MÁS DE 10,000 🔥'
  if (battlePower > 5000) return '💥 MÁS DE 5,000 ⚡'
  if (battlePower > 1000) return '✨ MÁS DE 1,000 💫'
  return '🌀 ' + battlePower.toLocaleString()
}