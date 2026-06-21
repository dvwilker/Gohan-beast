import { getUser, getCooldown, formatTime, formatNumber } from './economy.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = getUser(userId)
  
  if (!user.registered) {
    return conn.reply(m.chat, '❌ Debes registrarte primero. Usa .reg nombre.edad', m)
  }

  const commands = [
    { cmd: 'daily', label: 'Recompensa diaria' },
    { cmd: 'work', label: 'Trabajar' },
    { cmd: 'mine', label: 'Minar' },
    { cmd: 'run', label: 'Correr' },
    { cmd: 'slut', label: 'Slut' },
    { cmd: 'rob', label: 'Robar' },
    { cmd: 'hunt', label: 'Cazar' },
    { cmd: 'fish', label: 'Pescar' },
    { cmd: 'gamble', label: 'Apostar' }
  ]

  let info = commands.map(({ cmd, label }) => {
    const cooldown = getCooldown(userId, cmd)
    const status = cooldown > 0 ? `⏳ ${formatTime(cooldown)}` : '✅ Listo'
    return `┃ .${cmd} → ${status}`
  }).join('\n')

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — ESTADO ECONÓMICO

📊 *Cooldowns:*

${info}

━━━━━━━━━━━━━━━━━━━━
💰 *Coins:* ${formatNumber(user.coins)} ${global.coin}
🏦 *Banco:* ${formatNumber(user.bank)} ${global.coin}
💎 *Total:* ${formatNumber(user.coins + user.bank)} ${global.coin}
⚡ *Experiencia:* ${formatNumber(user.exp)}
🏆 *Nivel:* ${Math.floor(user.exp / 1000)}

📌 *Comandos sin cooldown:*
┃ .pay @user <cantidad>
┃ .ppt <piedra/papel/tijera> <cantidad>
    `.trim(), m)
  await m.react('📊')
}

handler.command = ['einfo']
handler.tags = ['economy']
handler.help = ['einfo']

export default handler