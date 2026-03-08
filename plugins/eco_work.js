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
      `⚡ *GOHAN BESTIA - KI AGOTADO* ⚡\n\n🦾 Guerrero: @${senderId.split("@")[0]}\n⏳ Recarga energía en: *${timeLeft}*`,
      m,
      { mentions: [senderId], ...global.rcanal }
    )
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users).random()
  while (randomUserId === senderId) randomUserId = Object.keys(users).random()

  // GOHAN BESTIA - Ganancias aumentadas 🔥
  let minAmount = 150
  let maxAmount = 500
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
  let randomOption = Math.floor(Math.random() * 14)

  const frases = [
    `🦾 *GOHAN BESTIA DESATA SU PODER* 🦾\n\n✦ Le robaste el ki a @${randomUserId.split("@")[0]} con un golpe bestial\n➩ Ganaste *${amountTaken} ${moneda}* 💥`,
    
    `⚡ *ATAQUE SÚPER SAIYAN* ⚡\n\n✦ @${randomUserId.split("@")[0]} sintió el poder de Gohan Bestia\n➩ Te transfirió *${amountTaken} ${moneda}* de energía 🌀`,
    
    `💫 *GOHAN BESTIA - FURIA DESATADA* 💫\n\n✦ Tu poder hizo temblar a @${randomUserId.split("@")[0]}\n➩ Obtuviste *${amountTaken} ${moneda}* 💢`,
    
    `🌟 *MODO BESTIA ACTIVADO* 🌟\n\n✦ @${randomUserId.split("@")[0]} no pudo resistir tu fuerza\n➩ Te dio *${amountTaken} ${moneda}* por piedad 🙏`,
    
    `🔥 *PODER DE GOHAN BESTIA* 🔥\n\n✦ Tu ki bestial asustó a @${randomUserId.split("@")[0]}\n➩ Te soltó *${amountTaken} ${moneda}* para que te calmes 😱`,
    
    `🌀 *GOHAN BESTIA - TRANSFORMACIÓN* 🌀\n\n✦ @${randomUserId.split("@")[0]} vio tu cabello plateado y se rindió\n➩ Te dio *${amountTaken} ${moneda}* 💫`,
    
    `💥 *GOLPE BESTIA* 💥\n\n✦ Le diste un manotazo a @${randomUserId.split("@")[0]} y soltó\n➩ *${amountTaken} ${moneda}* 🦾`,
    
    `⚡ *GOHAN BESTIA VS EL UNIVERSO* ⚡\n\n✦ @${randomUserId.split("@")[0]} sintió tu poder y te pagó\n➩ *${amountTaken} ${moneda}* para que no lo destruyas 🌍`,
    
    `🌟 *LA BESTIA HA DESPERTADO* 🌟\n\n✦ @${randomUserId.split("@")[0]} te vio transformarte y te dio\n➩ *${amountTaken} ${moneda}* por miedo 😨`,
    
    `💢 *GOHAN BESTIA - IRRITADO* 💢\n\n✦ Te enojaste y @${randomUserId.split("@")[0]} te pagó\n➩ *${amountTaken} ${moneda}* para que te calmes 🥶`,
    
    `🌀 *PODER BESTIAL INFINITO* 🌀\n\n✦ @${randomUserId.split("@")[0]} sintió tu aura y te dio\n➩ *${amountTaken} ${moneda}* de ofrenda 🙇`,
    
    `🔥 *GOHAN BESTIA - MÁXIMO PODER* 🔥\n\n✦ Tu ki hizo llorar a @${randomUserId.split("@")[0]}\n➩ Te dio *${amountTaken} ${moneda}* por compasión 😭`,
    
    `⚡ *ATAQUE DE COLERA BESTIA* ⚡\n\n✦ @${randomUserId.split("@")[0]} te vio enojado y te pagó\n➩ *${amountTaken} ${moneda}* para que no explotes 💥`,
    
    `💫 *GOHAN BESTIA - LEYENDA VIVA* 💫\n\n✦ @${randomUserId.split("@")[0}] supo quién eres y te dio\n➩ *${amountTaken} ${moneda}* por respeto 👑`
  ]

  const frasesFail = [
    `💢 *GOHAN BESTIA TROPIEZA* 💢\n\n✦ Te resbalaste con tu propio poder\n➩ Perdiste *-{amount} ${moneda}* por descuido 😅`,
    
    `🌀 *KI DESCONTROLADO* 🌀\n\n✦ Tu poder explotó en tu cara\n➩ Se te escaparon *-{amount} ${moneda}* 💥`,
    
    `⚡ *ERROR DE TRANSFORMACIÓN* ⚡\n\n✦ No pudiste controlar el modo bestia\n➩ Perdiste *-{amount} ${moneda}* en daños colaterales 🏥`,
    
    `🌟 *GOHAN BESTIA SE DISTRAE* 🌟\n\n✦ Viste una mariposa y perdiste el poder\n➩ Se te cayeron *-{amount} ${moneda}* 🦋`,
    
    `💥 *GOLPE FALLIDO* 💥\n\n✦ Atacaste pero te dieron contra el suelo\n➩ Te robaron *-{amount} ${moneda}* 😵`
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
    let failText = frasesFail.random().replace('{amount}', amountSubtracted)
    await conn.reply(m.chat, failText, m, { ...global.rcanal })
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['slut']
handler.command = ['slut', 'protituirse', 'bestiaslut', 'gohanslut']
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