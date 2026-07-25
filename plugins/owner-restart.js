let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, '❌ Solo el dueño puede reiniciar el bot.', m)
  }

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — REINICIO

🔄 *Reiniciando el bot...*

⏳ El poder divino se está recargando.
⚡ Vuelvo en unos segundos.

🐉 *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('🔄')
  
  process.exit(0)
}

handler.command = ['restart', 'reiniciar', 'reboot']
handler.tags = ['owner']
handler.help = ['restart']
handler.owner = true

export default handler