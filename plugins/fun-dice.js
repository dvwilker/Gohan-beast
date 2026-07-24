let handler = async (m, { conn }) => {
  const dice = Math.floor(Math.random() * 6) + 1
  const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — DADO

🎲 Tiraste el dado y salió:

${emojis[dice - 1]} *${dice}*

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
  await m.react('🎲')
}

handler.command = ['dice', 'dado', 'tirar']
handler.tags = ['fun']
handler.help = ['dice']

export default handler