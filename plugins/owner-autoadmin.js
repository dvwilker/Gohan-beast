const handler = async (m, { conn, groupMetadata }) => {
  try {
    const participants = groupMetadata.participants || []
    
    const isUserAdmin = participants.some(p => {
      const pid = p.id || p.jid || ''
      return pid === m.sender && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
    })

    if (isUserAdmin) {
      return m.reply('🐉 Ya eres administrador guerrero.')
    }

    const isBotAdmin = participants.some(p => {
      const pid = p.id || p.jid || ''
      return pid === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
    })

    if (!isBotAdmin) {
      return m.reply('❌ El bot necesita ser administrador para darte la corona.')
    }

    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    await m.react('👑')
    m.reply('🐉 Gohan Beast te ha otorgado el poder de administrador. ¡Úsalo con sabiduría!')
  } catch (e) {
    console.error('Error en autoadmin:', e)
    m.reply('❌ Ocurrió un error al darte la corona. Verifica que el bot sea admin.')
  }
}

handler.tags = ['owner']
handler.help = ['autoadmin']
handler.command = ['autoadmin']
handler.rowner = true
handler.group = true
handler.botAdmin = true

export default handler