// === COMANDO .LIST O .LISTSUBBOTS ===
const listSubbotsHandler = async (m, { conn }) => {
  // Filtrar subbots conectados (excluyendo el bot principal)
  const subBots = global.conns.filter((subbot) => {
    return subbot && 
           subbot.user && 
           subbot.ws && 
           subbot.ws.socket && 
           subbot.ws.socket.readyState === ws.OPEN &&
           subbot.user.jid !== conn.user.jid // Excluir el bot principal
  })
  
  if (subBots.length === 0) {
    return await conn.sendMessage(m.chat, {
      text: `📭 *No hay subbots conectados*\n\nUsa *.qr* o *.code* para conectar un subbot.`
    })
  }
  
  let message = `╭━━━〔 *SUBBOTS CONECTADOS* 〕━━━┈ 🤖\n┃\n`
  message += `┃ 📊 *Total:* ${subBots.length} subbots\n┃\n`
  
  subBots.forEach((subbot, index) => {
    const name = subbot.user.name || 'Desconocido'
    const jid = subbot.user.jid || 'N/A'
    const number = jid.split('@')[0]
    const connectedAt = subbot.connectedAt || new Date().toLocaleString()
    
    message += `┃ ${index + 1}. 🤖 *${name}*\n`
    message += `┃    📱 *Número:* ${number}\n`
    message += `┃    🆔 *JID:* ${jid}\n`
    message += `┃    ⏰ *Conectado:* ${connectedAt}\n`
    message += `┃\n`
  })
  
  message += `╰━━━━━━━━━━━━━━━━━━━━━━━━━┈ 🔗\n\n`
  message += `📌 *Comandos útiles:*\n`
  message += `▢ *.qr* - Conectar nuevo subbot\n`
  message += `▢ *.code* - Conectar con código\n`
  message += `▢ *.remove <número>* - Eliminar subbot`
  
  await conn.sendMessage(m.chat, { text: message })
}

// Agregar al handler principal
const handler = async (m, { conn, command, args }) => {
  switch(command) {
    case 'list':
    case 'listsubbots':
      await listSubbotsHandler(m, { conn })
      break
    // ... otros casos
  }
}

handler.command = ['list', 'listsubbots']