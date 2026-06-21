import { getUser, readUsers, saveUsers } from './economy.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ No estás registrado.', m)
  }

  const confirm = await conn.reply(m.chat, `
🐉 GOHAN BEAST — ELIMINAR CUENTA

⚠️ ¿Seguro que quieres eliminar tu cuenta?
Perderás todas tus coins, nivel y progreso.

Responde con *si* para confirmar
    `.trim(), m)

  const response = await new Promise(resolve => {
    conn.on('message', async (msg) => {
      if (msg.key.fromMe) return
      if (msg.key.remoteJid === m.chat && msg.key.participant === userId) {
        resolve(msg.message?.conversation || msg.message?.extendedTextMessage?.text || '')
      }
    })
    setTimeout(() => resolve('timeout'), 30000)
  })

  if (response.toLowerCase() !== 'si') {
    return conn.reply(m.chat, '❌ Operación cancelada.', m)
  }

  const users = readUsers()
  delete users[userId]
  saveUsers(users)

  await conn.reply(m.chat, '🐉 GOHAN BEAST\n\n✅ Cuenta eliminada.', m)
  await m.react('✅')
}

handler.command = ['unreg']
handler.tags = ['economy']
handler.help = ['unreg']

export default handler