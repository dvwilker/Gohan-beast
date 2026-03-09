
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  let moneda = global.moneda || '💸'
  
  // Números del creador (formato internacional sin +)
  const creadores = [
    '584125877491',  // Primer creador
    '5492644138998'  // Segundo creador
  ]
  
  // Verificar si es el owner del bot O si es uno de los creadores
  let esCreador = creadores.includes(m.sender.split('@')[0])
  
  if (!isOwner && !esCreador) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - ACCESO DENEGADO* ⚡\n\n🦾 Solo el *Creador del Bot* puede usar este comando.\n\n👑 *Creadores:*\n• +584125877491\n• +5492644138998\n\n💫 Tú no tienes este poder.`, 
      m
    )
  }

  // Verificar argumentos
  if (!args[0]) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - COMANDO DE CREADOR* ⚡\n\n👑 *Uso correcto:*\n\n➡️ *${usedPrefix + command} <cantidad> @usuario*\n➡️ *${usedPrefix + command} <cantidad>* (respondiendo al mensaje)\n\n💫 *Ejemplos:*\n• ${usedPrefix + command} 5000 @usuario\n• ${usedPrefix + command} 10000 (respondiendo a un mensaje)\n• ${usedPrefix + command} 1m @usuario (1 millón)\n• ${usedPrefix + command} 1k @usuario (1 mil)`, 
      m
    )
  }

  // Determinar el destinatario
  let who = m.mentionedJid?.[0] || m.quoted?.sender
  
  if (!who) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - DESTINATARIO REQUERIDO* ⚡\n\n👑 Debes etiquetar a alguien o responder a su mensaje.\n\n💫 Ejemplo: *${usedPrefix + command} 5000 @usuario*`, 
      m
    )
  }

  if (who === conn.user.jid) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - ERROR CÓSMICO* ⚡\n\n🦾 No puedes dar Zenis al bot... ¡él ya tiene poder infinito!`, 
      m
    )
  }

  // Verificar si el destinatario existe en la base de datos
  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - USUARIO NO REGISTRADO* ⚡\n\n❌ El usuario @${who.split('@')[0]} no está en la base de datos Saiyan.\n\n💫 Que use algún comando económico primero.`, 
      m, 
      { mentions: [who] }
    )
  }

  let user = global.db.data.users[who]
  let cantidad = 0

  // Procesar cantidad con sufijos (k, m, b)
  let cantidadInput = args[0].toLowerCase()
  
  if (cantidadInput.includes('k')) {
    cantidad = parseFloat(cantidadInput) * 1000
  } else if (cantidadInput.includes('m')) {
    cantidad = parseFloat(cantidadInput) * 1000000
  } else if (cantidadInput.includes('b')) {
    cantidad = parseFloat(cantidadInput) * 1000000000
  } else {
    cantidad = parseInt(cantidadInput)
  }

  // Validar cantidad
  if (isNaN(cantidad) || cantidad < 1) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - CANTIDAD INVÁLIDA* ⚡\n\n👑 Ingresa una cantidad válida de Zenis.\n\n💫 Ejemplos:\n• ${usedPrefix + command} 5000 @usuario\n• ${usedPrefix + command} 1m @usuario (1 millón)\n• ${usedPrefix + command} 500k @usuario (500 mil)`, 
      m
    )
  }

  // 🎁 REGALO DE CARTERA INFINITA - SIN AFECTAR A NADIE
  user.coin += cantidad

  // Obtener nombre del destinatario
  let targetName = await conn.getName(who)
  
  // Identificar quién dio el regalo
  let creadorNombre = esCreador ? '🌟 Creador Original' : '👑 Owner Saiyan'
  
  // Formatear cantidad para mostrarla
  let cantidadFormateada = cantidad.toLocaleString()
  let cantidadConSufijo = formatearNumero(cantidad)

  // Mensaje de éxito
  let mensaje = `
🌟 *GOHAN BESTIA - PODER DEL CREADOR* 🌟

╔══════════════════════╗
║   ✨ ¡BENDICIÓN DIVINA! ✨  ║
╚══════════════════════╝

🦾 *Otorgado por:* ${creadorNombre}
💫 *Guerrero bendecido:* ${targetName} (@${who.split('@')[0]})

💰 *Cantidad recibida:* *+${cantidadFormateada} ${moneda}* (${cantidadConSufijo})

📊 *NUEVO PODER DEL GUERRERO:*
├ 💰 Ki en mano: *${user.coin.toLocaleString()} ${moneda}*
├ 🏦 Ki en banco: *${(user.bank || 0).toLocaleString()} ${moneda}*
└ ✨ Ki total: *${((user.coin || 0) + (user.bank || 0)).toLocaleString()} ${moneda}*

🌀 *ESTE REGALO VIENE DEL PODER INFINITO DEL CREADOR* 🌀
💥 *NO AFECTA A NADIE, SOLO TE FORTALECE* 💥
⭐ *¡QUE EL GRAN SAIYAN TE BENDIGA!* ⭐
  `.trim()

  await conn.reply(m.chat, mensaje, m, { mentions: [who] })
  
  global.db.write()
}

handler.help = ['dar']
handler.tags = ['creator']
handler.command = ['dar', 'give', 'regalar', 'bendecir', 'creador']
handler.rowner = false // Cambiamos a false porque ya validamos manualmente
handler.group = false
handler.register = false

export default handler

// Función para formatear número con sufijos
function formatearNumero(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toString()
  }
}