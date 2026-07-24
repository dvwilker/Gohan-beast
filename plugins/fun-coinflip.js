let handler = async (m, { conn }) => {
  const result = Math.random() < 0.5 ? 'Cara' : 'Sello'
  const emoji = result === 'Cara' ? '🪙' : '🪙'
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — CARA O SELLO

🪙 Lanzaste la moneda y salió:

${emoji} *${result}*

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
  await m.react('🪙')
}

handler.command = ['coinflip', 'moneda', 'caraosello']
handler.tags = ['fun']
handler.help = ['coinflip']

export default handler