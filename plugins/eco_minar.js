let cooldowns = {}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  // Gohan Bestia - ¡Poder desatado!
  let coin = pickRandom([200, 500, 700, 888, 1500, 2000, 2500, 3000, 5000, 9999])
  let emerald = pickRandom([10, 15, 20, 25, 30, 50])
  let iron = pickRandom([100, 150, 200, 250, 300, 400, 500, 600, 700, 800])
  let gold = pickRandom([200, 300, 400, 500, 600, 800, 1000])
  let coal = pickRandom([500, 600, 700, 800, 1000, 1200, 1500, 2000])
  let stone = pickRandom([2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000])

  let img = 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745557957843.jpeg' // Cambia esta imagen por una de Gohan Bestia si quieres
  let cooldownTime = 600000
  let now = Date.now()
  let nextMine = (user.lastmiming || 0) + cooldownTime

  if (now < nextMine) {
    let wait = msToTime(nextMine - now)
    return conn.reply(m.chat, `⚡ *Ki en recuperación* ⚡\nGohan Bestia necesita descansar: *${wait}*`, m, { ...global.rcanal })
  }

  // XP aumentada como el poder de Gohan
  let exp = Math.floor(Math.random() * 5000) + 2000

  let info = `
🦾 *MODO GOHAN BESTIA ACTIVADO* 🦾

⛏️ *Minaste con la furia de un Saiyan:*

✨ XP Bestia: *${exp}*
💰 Zeni: *${coin}*
♦️ Esferas del Dragón: *${emerald}*
🔩 Katchin (Hierro): *${iron}*
🏅 Oro Saiyan: *${gold}*
🕋 Carbón Ardiente: *${coal}*
🪨 Roca Planetaria: *${stone}*

🔥 ¡EL PODER DE GOHAN BESTIA NO TIENE LÍMITES! 🔥
`.trim()

  await conn.sendFile(m.chat, img, 'mina.jpg', info, m, { ...global.rcanal })
  await m.react('🦾')

  // Gohan Bestia resiste más el daño
  user.health -= 20 // Menos daño por su resistencia Saiyan
  user.pickaxedurability -= 15 // Menor desgaste
  user.coin += coin
  user.emerald += emerald
  user.iron += iron
  user.gold += gold
  user.coal += coal
  user.stone += stone
  user.lastmiming = now

  global.db.write()
}

handler.help = ['minar']
handler.tags = ['eco']
handler.command = ['minar', 'miming', 'mine', 'gohanbestia']
handler.register = false
handler.group = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  return `${minutes} m y ${seconds} s`
}