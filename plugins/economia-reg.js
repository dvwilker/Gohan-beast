import { getUser, updateUser, formatNumber } from '../economy-system.js'

let handler = async (m, { conn, text }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (user.registered) {
    const level = Math.floor(user.exp / 1000)
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => null)
    const foto = pp || 'https://i.ibb.co/5LB7JYq/default-avatar.png'
    
    await conn.sendMessage(m.chat, {
      image: { url: foto },
      caption: `
🐉 GOHAN BEAST — PERFIL

👤 Nombre: ${user.name || 'Sin nombre'}
📅 Edad: ${user.age || 'Sin edad'}
🏆 Nivel: ${level}
💎 Coins: ${formatNumber(user.coins)}
🏦 Banco: ${formatNumber(user.bank)}
⚡ Exp: ${formatNumber(user.exp)}
    `.trim()
    }, { quoted: m })
    return
  }

  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — REGISTRO

⚡ Para registrarte usa:
.reg nombre.edad

📌 Ejemplo: .reg DvWilkerOFC.15

🎁 Recompensa: ${formatNumber(global.regCoins)} ${global.coin}
    `.trim(), m)
  }

  const [name, age] = text.split('.')
  if (!name || !age || isNaN(age)) {
    return conn.reply(m.chat, '❌ Formato incorrecto. Usa: .reg nombre.edad', m)
  }

  user.registered = true
  user.name = name.trim()
  user.age = parseInt(age)
  user.coins = global.regCoins
  user.exp = 0
  updateUser(userId, user)

  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => null)
  const foto = pp || 'https://i.ibb.co/5LB7JYq/default-avatar.png'

  await conn.sendMessage(m.chat, {
    image: { url: foto },
    caption: `
🐉 GOHAN BEAST — REGISTRO EXITOSO

✅ ¡Bienvenido guerrero ${name}!

🎁 Recompensa: ${formatNumber(global.regCoins)} ${global.coin}
📅 Edad: ${age} años
    `.trim()
  }, { quoted: m })
  await m.react('🐉')
}

handler.command = ['reg']
handler.tags = ['economy']
handler.help = ['reg nombre.edad']

export default handler