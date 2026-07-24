import { getUser, readUsers, saveUsers } from '../economy-system.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ No estás registrado.', m)
  }

  const users = readUsers()
  delete users[userId]
  saveUsers(users)

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — CUENTA ELIMINADA

✅ Tu cuenta ha sido eliminada exitosamente.

💔 Adiós guerrero, siempre tendrás un lugar en el Kame House.

⚡ Si deseas volver, usa .reg nombre.edad
  `.trim(), m)
  await m.react('💔')
}

handler.command = ['unreg']
handler.tags = ['economy']
handler.help = ['unreg']

export default handler