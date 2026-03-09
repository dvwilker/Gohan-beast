let cooldowns = {}
let peleasActivas = new Set()

let handler = async (m, { conn, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  let moneda = global.moneda || '💸'
  
  // Verificar cooldown (5 minutos)
  const cooldownTime = 300000 // 5 minutos
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldownTime) {
    let timeLeft = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldownTime - Date.now()) / 1000))
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - KI RECARGANDO* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n⏳ Espera *${timeLeft}* para volver a pelear contra Freezer`, 
      m, 
      { mentions: [m.sender] }
    )
  }

  // Verificar si ya tiene una pelea activa
  if (peleasActivas.has(m.sender)) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - PELEA ACTIVA* ⚡\n\n🦾 Ya estás peleando contra Freezer. ¡Termina esa pelea primero!`, 
      m
    )
  }

  // Verificar si tiene suficiente dinero (mínimo 1000 para poder pagar si pierde)
  if (user.coin < 1000) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - SIN PODER SUFICIENTE* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n\n❌ Necesitas al menos *1000 ${moneda}* para enfrentar a Freezer.\n💰 Tienes: *${user.coin} ${moneda}*`, 
      m, 
      { mentions: [m.sender] }
    )
  }

  // Marcar que tiene pelea activa
  peleasActivas.add(m.sender)

  // Enviar mensaje inicial de la pelea
  let mensaje = await conn.sendMessage(m.chat, {
    text: crearMensajeInicioPelea(m.sender, moneda)
  })

  // ANIMACIÓN DE LA PELEA (4 pasos) - TODOS EDITANDO EL MISMO MENSAJE
  const frasesPelea = [
    "💥 FREEZER: '¡JAJAJA! ¿UN SAIYANO INSECTO?' 💥",
    "⚡ GOKU: '¡USA EL PODER BESTIA, HIJO!' ⚡",
    "🌀 GOHAN: '¡AAAAAAAAAH! ¡MODO BESTIA!' 🌀",
    "💫 FREEZER: '¿QUÉ? ¡ESO NO ES POSIBLE!' 💫"
  ]

  for (let i = 0; i < frasesPelea.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    await conn.sendMessage(m.chat, {
      text: crearMensajePelea(m.sender, frasesPelea[i], i + 1, moneda),
      edit: mensaje.key
    })
  }

  // Determinar resultado de la pelea (40% de ganar, 60% de perder)
  let gano = Math.random() < 0.4 // 40% de probabilidad de ganar
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Aplicar resultado
  let mensajeFinal
  if (gano) {
    user.coin += 5000
    mensajeFinal = crearMensajeVictoria(m.sender, moneda)
  } else {
    user.coin = Math.max(0, user.coin - 1000)
    mensajeFinal = crearMensajeDerrota(m.sender, moneda)
  }

  // EDITAR el mismo mensaje con el resultado final
  await conn.sendMessage(m.chat, {
    text: mensajeFinal,
    edit: mensaje.key
  })

  // Guardar cooldown y quitar de peleas activas
  cooldowns[m.sender] = Date.now()
  peleasActivas.delete(m.sender)
  
  global.db.write()
}

handler.help = ['saiyan']
handler.tags = ['eco']
handler.command = ['saiyan', 'freezer', 'peleacontrafreezer']
handler.register = false
handler.group = false

export default handler

function crearMensajeInicioPelea(sender, moneda) {
  return `
🦾 *GOHAN BESTIA - VS FREEZER* 🦾

⚡ Guerrero: @${sender.split('@')[0]}

🔥 ¡COMIENZA LA BATALLA CONTRA EL EMPERADOR FREEZER! 🔥

╔══════════════════╗
║     👾 VS 🦾     ║
║   FREEZER   GOHAN ║
╚══════════════════╝

🌀 PREPARANDO PODER BESTIA...
`.trim()
}

function crearMensajePelea(sender, frase, paso, moneda) {
  const barras = ['⬜⬜⬜⬜', '🟨⬜⬜⬜', '🟨🟨⬜⬜', '🟨🟨🟨⬜', '🟨🟨🟨🟨']
  
  return `
🦾 *GOHAN BESTIA - VS FREEZER* 🦾

⚡ Guerrero: @${sender.split('@')[0]}

${frase}

⚔️ *PODER BESTIA: ${barras[paso]}* ⚔️

🌀 LA BATALLA CONTINÚA...
`.trim()
}

function crearMensajeVictoria(sender, moneda) {
  return `
🦾 *GOHAN BESTIA - VICTORIA* 🦾

⚡ Guerrero: @${sender.split('@')[0]}

╔══════════════════════╗
║   🏆 ¡VICTORIA! 🏆   ║
╚══════════════════════╝

💫 *FREEZER HA SIDO DERROTADO* 💫

💰 *RECOMPENSA:* *+5000 ${moneda}*

🌀 ¡EL PODER BESTIA HA TRIUNFADO! 🌀
💥 ¡FREEZER NUNCA VOLVERÁ A MOLESTAR! 💥
`.trim()
}

function crearMensajeDerrota(sender, moneda) {
  return `
🦾 *GOHAN BESTIA - DERROTA* 🦾

⚡ Guerrero: @${sender.split('@')[0]}

╔══════════════════════╗
║   💢 ¡DERROTA! 💢   ║
╚══════════════════════╝

💥 *FREEZER TE HA VENCIDO* 💥

💰 *PÉRDIDA:* *-1000 ${moneda}*

🌀 NECESITAS ENTRENAR MÁS DURO 🌀
💥 ¡VUELVE MÁS FUERTE, GUERRERO! 💥
`.trim()
}

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segs = segundos % 60
  return `${minutos}m ${segs}s`
}