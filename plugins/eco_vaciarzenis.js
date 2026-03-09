let handler = async (m, { conn, args, usedPrefix, command }) => {
  let moneda = global.moneda || '💸'
  
  // Números de los creadores autorizados
  const creadores = [
    '5492644138998',  // Creador 1
    '584125877491'    // Creador 2
  ]
  
  // Verificar si quien ejecuta es un creador
  let esCreador = creadores.includes(m.sender.split('@')[0])
  
  if (!esCreador) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - ACCESO DENEGADO* ⚡\n\n🦾 Solo los *Creadores del Bot* pueden usar este comando.\n\n👑 *Creadores autorizados:*\n• +5492644138998\n• +584125877491\n\n💫 Tú no tienes este poder.`, 
      m
    )
  }

  // Verificar que sea una respuesta a un mensaje
  if (!m.quoted) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - VACIAR CARTERA* ⚡\n\n👑 *Uso correcto:*\n\n➡️ Responde al mensaje de la persona que quieres vaciar con:\n*${usedPrefix + command}*\n\n💫 *Ejemplo:*\n1. Busca un mensaje del usuario\n2. Responde con: *${usedPrefix + command}*`, 
      m
    )
  }

  // Obtener el ID de la persona a vaciar (la que envió el mensaje al que respondemos)
  let who = m.quoted.sender
  
  if (who === conn.user.jid) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - ERROR CÓSMICO* ⚡\n\n🦾 No puedes vaciar al bot... ¡su poder es infinito!`, 
      m
    )
  }

  // Verificar si el usuario existe en la base de datos
  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, 
      `⚡ *GOHAN BESTIA - USUARIO NO REGISTRADO* ⚡\n\n❌ El usuario @${who.split('@')[0]} no está en la base de datos Saiyan.\n\n💫 Que use algún comando económico primero.`, 
      m, 
      { mentions: [who] }
    )
  }

  let user = global.db.data.users[who]
  
  // Guardar cantidades anteriores para mostrarlas
  let coinAnterior = user.coin || 0
  let bankAnterior = user.bank || 0
  let totalAnterior = coinAnterior + bankAnterior

  // 💢 VACIAR TODO - Poner en 0
  user.coin = 0
  user.bank = 0

  // Obtener nombre del desafortunado
  let targetName = await conn.getName(who)
  let creadorNombre = await conn.getName(m.sender)

  // Mensaje de vaciado
  let mensaje = `
💢 *GOHAN BESTIA - PODER DEL VACÍO* 💢

╔══════════════════════╗
║   🌪️ ¡CARTERA VACIADA! 🌪️  ║
╚══════════════════════╝

👑 *Ejecutado por:* ${creadorNombre} (@${m.sender.split('@')[0]})
🎯 *Victima:* ${targetName} (@${who.split('@')[0]})

💰 *CANTIDADES ELIMINADAS:*
├ 💰 Ki en mano: *-${coinAnterior.toLocaleString()} ${moneda}*
├ 🏦 Ki en banco: *-${bankAnterior.toLocaleString()} ${moneda}*
└ ✨ Ki total eliminado: *-${totalAnterior.toLocaleString()} ${moneda}*

📊 *NUEVO PODER DE LA VÍCTIMA:*
├ 💰 Ki en mano: *0 ${moneda}*
├ 🏦 Ki en banco: *0 ${moneda}*
└ ✨ Ki total: *0 ${moneda}*

🌀 *EL PODER DEL VACÍO HA HABLADO* 🌀
💥 *NI FREEZER SE SALVA DE ESTO* 💥
⚠️ *LA PRÓXIMA VEZ TEN CUIDADO* ⚠️
  `.trim()

  await conn.reply(m.chat, mensaje, m, { mentions: [m.sender, who] })
  
  global.db.write()
}

handler.help = ['vaciar']
handler.tags = ['eco']
handler.command = ['vaciar', 'empty', 'resetear', 'limpiar']
handler.rowner = false
handler.group = false
handler.register = false

export default handler