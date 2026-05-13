import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const autobioFile = path.resolve(__dirname, "../json/autobio.json")
const premiumFile = path.resolve(__dirname, "../json/premium.json")

if (!fs.existsSync(autobioFile)) {
  fs.writeFileSync(autobioFile, JSON.stringify({ enabled: false, intervalMinutes: 5 }, null, 2))
}

if (!global.__autobioLoops) global.__autobioLoops = {}

function readJSONSafe(p) {
  try {
    if (!fs.existsSync(p)) return null
    const raw = fs.readFileSync(p, "utf8")
    return JSON.parse(raw || "null")
  } catch (e) {
    return null
  }
}

function writeJSON(p, d) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2))
}

function normalizeNumber(s) {
  return String(s || "").replace(/[^0-9]/g, "")
}

function getRawBotJid(conn) {
  return String(conn?.user?.jid || conn?.user?.id || conn?.user?.me?.id || "") || ""
}

function getBotNumber(conn) {
  const raw = getRawBotJid(conn)
  return normalizeNumber(raw.split("@")[0] || raw)
}

function isBotPremium(conn) {
  const list = readJSONSafe(premiumFile) || []
  if (!Array.isArray(list)) return false
  const normalized = list.map(x => normalizeNumber(x))
  const botNum = getBotNumber(conn)
  return normalized.includes(botNum)
}

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":")
}

async function startLoop(conn) {
  const jid = getRawBotJid(conn)
  if (!jid) return
  if (global.__autobioLoops[jid]) return

  const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
  const intervalMs = Math.max(1, parseInt(cfg.intervalMinutes || 5)) * 60 * 1000

  const tick = async () => {
    try {
      const up = clockString(process.uptime() * 1000)
      const premium = isBotPremium(conn)
      const bio = `🐉 Gohan Beast V1 | ⏱️ ${up} | ${premium ? "🌟 Premium" : "⚡ Free"}`
      await conn.updateProfileStatus(bio).catch(() => {})
    } catch (e) {
      console.error("autobio tick error:", e?.message || e)
    }
  }

  await tick()
  const id = setInterval(tick, intervalMs)
  global.__autobioLoops[jid] = id
}

function stopLoop(conn) {
  const jid = getRawBotJid(conn)
  const id = jid ? global.__autobioLoops[jid] : null
  if (id) {
    clearInterval(id)
    delete global.__autobioLoops[jid]
  }
}

let handler = async (m, { conn, args }) => {
  if (!global.owner.map(v => v.replace(/[^0-9]/g, "")).includes(m.sender.split("@")[0])) {
    return conn.reply(m.chat, `🐉 GOHAN BEAST\n⚡ Solo el Saiyajin Supremo puede usar este comando.`, m)
  }

  const opt = (args[0] || "").toLowerCase()

  if (opt === "on") {
    const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
    if (cfg.enabled) return m.reply("🐉 Auto-bio ya está activado.")
    cfg.enabled = true
    writeJSON(autobioFile, cfg)
    await startLoop(conn)
    return m.reply(`🐉 GOHAN BEAST\n✅ Auto-bio activado.\n📌 El bot actualizará su estado cada ${cfg.intervalMinutes} minutos.`)
  }

  if (opt === "off") {
    const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
    if (!cfg.enabled) return m.reply("🐉 Auto-bio ya está desactivado.")
    cfg.enabled = false
    writeJSON(autobioFile, cfg)
    stopLoop(conn)
    return m.reply("🐉 GOHAN BEAST\n❌ Auto-bio desactivado.")
  }

  if (opt === "set") {
    const minutes = parseInt(args[1])
    if (isNaN(minutes) || minutes < 1) return m.reply("🐉 Uso: .autobio set <minutos> (mínimo 1)")
    const cfg = readJSONSafe(autobioFile) || {}
    cfg.intervalMinutes = minutes
    writeJSON(autobioFile, cfg)
    stopLoop(conn)
    if (cfg.enabled) await startLoop(conn)
    return m.reply(`🐉 GOHAN BEAST\n✅ Intervalo cambiado a ${minutes} minutos.`)
  }

  if (opt === "status") {
    const cfg = readJSONSafe(autobioFile) || { enabled: false, intervalMinutes: 5 }
    const botJid = getRawBotJid(conn)
    const botNum = getBotNumber(conn)
    const premium = isBotPremium(conn)
    const isRunning = global.__autobioLoops[getRawBotJid(conn)] ? true : false
    
    return m.reply(`
🐉 GOHAN BEAST - AUTO-BIO STATUS

📡 Estado: ${cfg.enabled ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}
🔄 Loop activo: ${isRunning ? '✅ Sí' : '❌ No'}
⏱️ Intervalo: ${cfg.intervalMinutes} minutos
📱 Bot JID: ${botJid}
🔢 Bot número: ${botNum}
💎 Premium: ${premium ? '✅ Sí' : '❌ No'}

📌 Comandos:
.autobio on - Activar
.autobio off - Desactivar
.autobio set <min> - Cambiar intervalo
.autobio status - Ver estado
    `.trim())
  }

  return m.reply(`🐉 GOHAN BEAST\n\n📌 Uso:\n.autobio on - Activar auto-bio\n.autobio off - Desactivar\n.autobio set <minutos> - Cambiar intervalo\n.autobio status - Ver estado`)
}

handler.help = ["autobio on", "autobio off", "autobio set <min>", "autobio status"]
handler.tags = ["owner"]
handler.command = ["autobio"]
handler.rowner = true

handler.before = async (m, { conn }) => {
  const cfg = readJSONSafe(autobioFile) || { enabled: false }
  if (cfg.enabled) await startLoop(conn)
  else stopLoop(conn)
}

export default handler