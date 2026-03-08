let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = await conn.getName(senderId)
  let moneda = global.moneda || '💸'

  const cooldownTime = 5 * 60 * 1000
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldownTime) {
    let timeLeft = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldownTime - Date.now()) / 1000))
    return conn.reply(
      m.chat,
      `⚡ *GOHAN BESTIA - KI AGOTADO* ⚡\n\n🦾 Saiyan: @${senderId.split("@")[0]}\n⏳ Recarga tu poder en: *${timeLeft}*`,
      m,
      { mentions: [senderId], ...global.rcanal }
    )
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users).random()
  while (randomUserId === senderId) randomUserId = Object.keys(users).random()

  // GOHAN BESTIA - PODER AUMENTADO
  let minAmount = 100 // Antes 15
  let maxAmount = 500 // Antes 50
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
  let randomOption = Math.floor(Math.random() * 14)

  // FRASES ÉPICAS DE GOHAN BESTIA
  const frases = [
    `🦾 *GOHAN BESTIA - ATAQUE SORPRESA* 🦾\n\n✦ Le robaste el ki a @${randomUserId.split("@")[0]} con un Masenko!\n➩ Ganaste *${amountTaken} ${moneda}* ⚡`,
    
    `💥 *GOHAN BESTIA - PODER DESATADO* 💥\n\n✦ Le diste una patada voladora a @${randomUserId.split("@")[0]} que lo mandó a la luna 🌙\n➩ *+${amountTaken} ${moneda}*`,
    
    `🌀 *MODO BESTIA - FURIA SAIYAN* 🌀\n\n✦ Usaste el Kamehameha con @${randomUserId.split("@")[0]} y quedó temblando!\n➩ Te pagó *${amountTaken} ${moneda}*`,
    
    `⚡ *GOHAN BESTIA - PODER MÁXIMO* ⚡\n\n✦ Te transformaste frente a @${randomUserId.split("@")[0]} y se derritió 🥵\n➩ *${amountTaken} ${moneda}*`,
    
    `💫 *ATAQUE BESTIAL - NIVEL DIOS* 💫\n\n✦ Le hiciste el ataque de la Bestia a @${randomUserId.split("@")[0]}, explotó su ki!\n➩ *+${amountTaken} ${moneda}*`,
    
    `🔥 *GOHAN BESTIA - FURIA CONTENIDA* 🔥\n\n✦ @${randomUserId.split("@")[0]} sintió tu poder y te dio su zeni voluntariamente\n➩ *${amountTaken} ${moneda}*`,
    
    `🌟 *PODER SAIYAN - NIVEL LEGENDARIO* 🌟\n\n✦ Te pusiste en posición de combate y @${randomUserId.split("@")[0]} se rindió\n➩ Te dio *${amountTaken} ${moneda}*`,
    
    `💢 *GOHAN BESTIA - IRRITADO* 💢\n\n✦ @${randomUserId.split("@")[0]} te miró feo y le diste un golpe de ki\n➩ Te dejó *${amountTaken} ${moneda}*`,
    
    `⚡ *SUPER SAIYAN BESTIA - ACTIVADO* ⚡\n\n✦ @${randomUserId.split("@")[0]} quedó impresionado con tu poder\n➩ *+${amountTaken} ${moneda}*`,
    
    `🌀 *GOHAN BESTIA - MAESTRO DEL KI* 🌀\n\n✦ Le enseñaste a @${randomUserId.split("@")[0]} el poder Bestia\n➩ Te pagó *${amountTaken} ${moneda}*`,
    
    `💥 *PODER INFINITO - GOHAN BESTIA* 💥\n\n✦ @${randomUserId.split("@")[0]} intentó atacarte pero falló\n➩ Te dio *${amountTaken} ${moneda}*`,
    
    `🦾 *GOHAN BESTIA - GUERRERO LEGENDARIO* 🦾\n\n✦ Tu aura bestial asustó a @${randomUserId.split("@")[0]}\n➩ Te dio *${amountTaken} ${moneda}*`,
    
    `⚡ *SUPER BESTIA - PODER CÓSMICO* ⚡\n\n✦ Hiciste temblar la tierra con tu ki y @${randomUserId.split("@")[0]} te respetó\n➩ *${amountTaken} ${moneda}*`,
    
    `💫 *GOHAN BESTIA - MODO DIOS* 💫\n\n✦ @${randomUserId.split("@")[0]} sintió tu poder divino\n➩ Te ofreció *${amountTaken} ${moneda}*`
  ]

  const frasesFail = [
    `💢 *GOHAN BESTIA - ERROR DE KI* 💢\n\n✦ Te diste contra un árbol y perdiste poder!\n➩ Perdiste ${moneda} por torpe`,
    
    `🌪️ *GOHAN BESTIA - ATAQUE FALLIDO* 🌪️\n\n✦ Tu Kamehameha salió mal y te lastimaste solo\n➩ Te descontaron ${moneda}`,
    
    `💥 *GOHAN BESTIA - PODER INESTABLE* 💥\n\n✦ No controlaste tu transformación y te debilitaste\n➩ Perdiste ${moneda}`,
    
    `⚡ *GOHAN BESTIA - KI AGOTADO* ⚡\n\n✦ Gastaste toda tu energía en un ataque inútil\n➩ Te quitaron ${moneda}`,
    
    `🌀 *GOHAN BESTIA - ERROR FATAL* 🌀\n\n✦ Intentaste el Masenko pero no salió nada\n➩ Te cobraron por el intento ${moneda}`
  ]

  if (randomOption < frases.length) {
    users[senderId].coin += amountTaken
    users[randomUserId].coin -= amountTaken
    await conn.sendMessage(m.chat, {
      text: frases[randomOption],
      mentions: [randomUserId],
      ...global.rcanal
    }, { quoted: m })
  } else {
    let maxRest = Math.min(senderCoin, maxAmount)
    let amountSubtracted = Math.floor(Math.random() * (maxRest - minAmount + 1)) + minAmount
    users[senderId].coin -= amountSubtracted
    await conn.reply(m.chat, `${frasesFail.random()}\n\n➩ Se restan *-${amountSubtracted} ${moneda}* a ${senderName}`, m, { ...global.rcanal })
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['slut']
handler.command = ['slut', 'protituirse', 'poderbestia']
handler.register = false
handler.group = false

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos}m ${segundosRestantes}s`
}

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}