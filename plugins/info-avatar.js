let handler = async (m, { conn }) => {
  const user = m.mentionedJid?.[0] || m.sender
  const pp = await conn.profilePictureUrl(user, 'image').catch(() => null)
  
  if (!pp) {
    return conn.reply(m.chat, `
🐉 *GOHAN BEAST* 🐉

❌ El usuario no tiene foto de perfil.
    `.trim(), m)
  }

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: `
🐉 *GOHAN BEAST — FOTO DE PERFIL* 🐉

👤 Usuario: @${user.split('@')[0]}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim()
  }, { mentions: [user] })
  await m.react('🖼️')
}

handler.command = ['avatar', 'foto', 'pfp']
handler.tags = ['info']
handler.help = ['avatar']

export default handler