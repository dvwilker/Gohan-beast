import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../json/antiprivado.json')

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

function writeConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2))
}

const handler = async (m, { command, args, isOwner }) => {
  if (!isOwner) {
    return m.reply('🐉 Solo el dueño puede usar este comando.')
  }

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

handler.before = async (m, { conn }) => {
  if (m.isGroup) return false

  const botJid = conn.user?.jid || ''
  
  let config = readConfig()
  if (!config.antiprivado) return false

  const ownerNumbers = (global.owner || []).map(o => {
    const number = Array.isArray(o) ? o[0] : o
    return number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  })

  if (ownerNumbers.includes(m.sender)) {
    return false
  }

  try {
    await conn.updateBlockStatus(m.sender, 'block')
    console.log(`🐉 Bloqueado: ${m.sender}`)
  } catch (e) {
    console.error('Error bloqueando usuario:', e)
  }

  return true
}

export default handler