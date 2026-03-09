let cooldowns = {}
let ruletaActiva = new Set()

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  let moneda = global.moneda || '💸'
  
  // Verificar cooldown
  const cooldownTime = 30000 // 30 segundos
  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldownTime) {
    let timeLeft = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldownTime - Date.now()) / 1000))
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - KI RECARGANDO* ⚡\n\n🦾 Guerrero: @${m.sender.split('@')[0]}\n⏳ Espera *${timeLeft}* para apostar de nuevo`, 
      m, 
      { mentions: [m.sender] }
    )
  }

  // Verificar si ya tiene una ruleta activa
  if (ruletaActiva.has(m.sender)) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - RULETA ACTIVA* ⚡\n\n🦾 Ya tienes una ruleta girando. ¡Espera a que termine!`, 
      m
    )
  }

  // Validar argumentos
  if (!args[0] || !args[1]) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - APUESTA SAIYAN* ⚡\n\n🦾 Uso: *${usedPrefix + command} <cantidad> <color>*\n\n🎨 *Colores disponibles:*\n🔴 rojo\n🟢 verde\n🔵 azul\n⬜ gris\n⚫ negro\n\n💫 Ejemplo: *${usedPrefix + command} 500 rojo*`, 
      m
    )
  }

  // Validar cantidad
  let apuesta = parseInt(args[0])
  if (isNaN(apuesta) || apuesta < 100) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - APUESTA MÍNIMA* ⚡\n\n🦾 La apuesta mínima es de *100 ${moneda}*`, 
      m
    )
  }

  // Validar color
  let colores = {
    'rojo': '🔴',
    'verde': '🟢',
    'azul': '🔵',
    'gris': '⬜',
    'negro': '⚫'
  }
  
  let colorElegido = args[1].toLowerCase()
  if (!colores[colorElegido]) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - COLOR INVÁLIDO* ⚡\n\n🦾 Colores disponibles:\n${Object.entries(colores).map(([nombre, emoji]) => `${emoji} ${nombre}`).join('\n')}`, 
      m
    )
  }

  // Verificar si tiene suficiente dinero
  if (user.coin < apuesta) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - KI INSUFICIENTE* ⚡\n\n🦾 Necesitas *${apuesta} ${moneda}* para apostar\n💰 Tienes: *${user.coin} ${moneda}*`, 
      m
    )
  }

  // Marcar que tiene ruleta activa
  ruletaActiva.add(m.sender)
  
  // Restar la apuesta
  user.coin -= apuesta

  // Posiciones de la ruleta (colores)
  const posiciones = [
    '🔴', '⚫', '🟢', '🔵', '⬜', '⚫', '🔴', '⬜', '🟢', '🔵',
    '⚫', '🔴', '🟢', '⬜', '🔵', '⚫', '🔴', '🟢', '🔵', '⬜',
    '⚫', '🔴', '🟢', '🔵', '⬜', '⚫', '🔴', '🟢', '⬜', '🔵',
    '⚫', '🔴', '🟢', '🔵', '⬜', '⚫', '🔴', '🟢', '🔵', '⬜'
  ]

  // Crear mensaje inicial de la ruleta
  let mensajeId = (await conn.sendMessage(m.chat, {
    text: crearMensajeRuleta(posiciones, 0, colores[colorElegido], apuesta, moneda, m.sender)
  })).key.id

  // ANIMACIÓN CORTA - 2 SEGUNDOS (4 pasos de 0.5s)
  for (let i = 1; i <= 4; i++) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Calcular posición actual para la animación
    let posActual = i * 5 // Avanza 5 posiciones cada vez
    
    await conn.sendMessage(m.chat, {
      text: crearMensajeRuleta(posiciones, posActual, colores[colorElegido], apuesta, moneda, m.sender),
      edit: mensajeId
    })
  }

  // Determinar resultado final
  let posFinal = Math.floor(Math.random() * posiciones.length)
  let colorGanador = posiciones[posFinal]
  let ganaste = (colorGanador === colores[colorElegido])
  
  // Calcular premio o pérdida
  let premio = 0
  let mensajeResultado = ''
  
  if (ganaste) {
    premio = 500 // Premio fijo de 500 Zenis
    user.coin += premio
    mensajeResultado = `✨ ¡GANASTE! Premio fijo: *+500 ${moneda}*`
  } else {
    // Penalización de 100 Zenis adicionales si pierde
    let penalizacion = 100
    user.coin = Math.max(0, user.coin - penalizacion)
    mensajeResultado = `💥 PERDISTE: *-${apuesta} ${moneda}* (apuesta) *-100 ${moneda}* (penalización)`
  }

  // Mensaje final
  await conn.sendMessage(m.chat, {
    text: crearMensajeFinal(posiciones, posFinal, colores[colorElegido], colorGanador, ganaste, apuesta, premio, penalizacion, mensajeResultado, moneda, m.sender),
    edit: mensajeId
  })

  // Guardar cooldown y quitar de ruletas activas
  cooldowns[m.sender] = Date.now()
  ruletaActiva.delete(m.sender)
  
  global.db.write()
}

handler.help = ['apostar']
handler.tags = ['eco']
handler.command = ['apostar', 'ruleta', 'bet', 'gamble']
handler.register = false
handler.group = false

export default handler

function crearMensajeRuleta(posiciones, offset, colorElegido, apuesta, moneda, sender) {
  let ruleta = []
  for (let i = 0; i < 9; i++) {
    let idx = (offset + i) % posiciones.length
    ruleta.push(posiciones[idx])
  }
  
  // Resaltar la posición central (la que se está evaluando)
  ruleta[4] = `⏺️${ruleta[4]}⏺️`
  
  return `
🦾 *GOHAN BESTIA - RULETA SAIYAN* 🦾

⚡ Guerrero: @${sender.split('@')[0]}
💰 Apuesta: *${apuesta} ${moneda}*
🎨 Color elegido: ${colorElegido}

🎰 *RULETA GIRANDO* 🎰
┌─────────────┐
│ ${ruleta[0]} │ ${ruleta[1]} │ ${ruleta[2]} │
│ ${ruleta[3]} │ ${ruleta[4]} │ ${ruleta[5]} │
│ ${ruleta[6]} │ ${ruleta[7]} │ ${ruleta[8]} │
└─────────────┘

🌀 *GIRANDO...* 🌀
`.trim()
}

function crearMensajeFinal(posiciones, posFinal, colorElegido, colorGanador, ganaste, apuesta, premio, penalizacion, mensajeResultado, moneda, sender) {
  let resultado = ganaste ? '🟢 ¡VICTORIA!' : '🔴 DERROTA'
  
  return `
🦾 *GOHAN BESTIA - RULETA SAIYAN* 🦾

⚡ Guerrero: @${sender.split('@')[0]}
💰 Apuesta: *${apuesta} ${moneda}*
🎨 Tu color: ${colorElegido}

🎯 *RESULTADO FINAL* 🎯
┌─────────────────┐
│ Posición: ${posFinal + 1}   Color: ${colorGanador} │
└─────────────────┘

📊 *${resultado}*
${mensajeResultado}

${ganaste ? '🌀 ¡EL PODER BESTIA TE ACOMPAÑA! 🌀' : '💢 ¡MEJOR SUERTE LA PRÓXIMA, GUERRERO! 💢'}
`.trim()
}

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segs = segundos % 60
  return `${minutos}m ${segs}s`
}