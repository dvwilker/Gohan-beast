import fs from 'fs'
import path from 'path'

const configPath = path.join('./json', 'antiprivado.json')

// Número específico del bot que podrá aplicar el antiprivado
// ⚠ IMPORTANTE: revisa si tu JID es @s.whatsapp.net o @c.us en tu sesión
const botNumberAllowed = '584262742966@s.whatsapp.net'

// === Leer configuración ===
function readConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ antiprivado: false }, null, 2))
    }
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    console.error('Error leyendo config antiprivado:', e)
    return { antiprivado: false }
  }
}

// === Guardar configuración ===
function writeConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2))
}

// === COMANDO ON/OFF SOLO OWNER ===
const handler = async (m, { command, args }) => {
  let config = readConfig()
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on2'

  if (type !== 'antiprivado') {
    return m.reply(`🐉 Usa:\n*.on2 antiprivado* / *.off2 antiprivado*`)
  }

  config.antiprivado = enable
  writeConfig(config)

  return m.reply(`🌀 Antiprivado ${enable ? 'activado' : 'desactivado'}.`)
}

handler.command = ['on2', 'off2']
handler.rowner = true
handler.tags = ['owner']
handler.help = ['on2 antiprivado', 'off2 antiprivado']

// === MIDDLEWARE ANTIPRIVADO ===
handler.before = async (m, { conn }) => {
  if (m.isGroup) return false // solo aplica en privado

  // Normalizar JID del bot
  const botJid = (conn.user?.jid || '').replace(/@c\.us$/, '@s.whatsapp.net')
  if (botJid !== botNumberAllowed) return false

  let config = readConfig()
  if (!config.antiprivado) return false

  // === Lista de Owners normalizados ===
  const ownerNumbers = (global.owner || []).map(o => {
    const number = Array.isArray(o) ? o[0] : o
    return number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  })

  // Si el remitente es owner → no bloquear
  if (ownerNumbers.includes(m.sender)) {
    console.log(`🐉 [Antiprivado] ${m.sender} es owner, no se bloquea.`)
    return false
  }

  try {
    // Bloquear al usuario
    await conn.updateBlockStatus(m.sender, 'block') // algunos usan 'block' en lugar de true
    console.log(`🐉 Bloqueado: ${m.sender}`)
  } catch (e) {
    console.error('Error bloqueando usuario:', e)
  }

  return true
}

export default handler