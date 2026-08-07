const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${global.jadi || 'JadiBots'}`, id)
  
  if (!fs.existsSync(pathYukiJadiBot)){
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }
  
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length
  
  if (subBotsCount >= 30) {
    return m.reply(`🐉 No hay espacios disponibles para más Sub-Bots. Límite: 30`)
  }

  const isCode = command === 'code' || args.includes('code')
  const isQR = command === 'qr' || !isCode
  
  let options = {
    pathYukiJadiBot: pathYukiJadiBot,
    m: m,
    conn: conn,
    args: args,
    usedPrefix: usedPrefix,
    command: command,
    isCode: isCode,
    isQR: isQR,
    fromCommand: true
  }
  
  await yukiJadiBot(options)
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler 

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command, isCode, isQR } = options
  const userJid = m.sender
  const userName = m.pushName || 'Usuario'
  
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  
  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    conn.reply(m.chat, `🐉 Uso correcto: ${usedPrefix + command}`, m)
    return
  }

  let { version, isLatest } = await fetchLatestBaileysVersion()
  const msgRetry = (MessageRetryMap) => { }
  const msgRetryCache = new NodeCache()
  const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

  const connectionOptions = {
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    auth: { 
      creds: state.creds, 
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
    },
    msgRetry,
    msgRetryCache,
    browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Gohan Beast SubBot', 'Chrome', '2.0.0'],
    version: version,
    generateHighQualityLinkPreview: true
  };

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  let isInit = true
  let qrSent = false
  let codeSent = false

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    
    if (isNewLogin) sock.isInit = false
    
    // Manejar QR
    if (qr && isQR && !qrSent) {
      qrSent = true
      const qrImage = await qrcode.toBuffer(qr, { scale: 8 })
      await conn.sendMessage(m.chat, { 
        image: qrImage, 
        caption: `
🐉 *VINCULACIÓN POR QR GOHAN BEAST* 🐉

👾 *Pasos para vincularte a Gohan:*
1️⃣ Abre WhatsApp en tu teléfono  
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados*  
3️⃣ Presiona *"Vincular un dispositivo"*  
4️⃣ Escanea el código QR que se muestra arriba

⚡ *Gohan Beast - Poder Máximo Activado*
        `.trim()
      }, { quoted: m })
      return
    }
    
    // Manejar código de 8 dígitos
    if (isCode && !codeSent) {
      codeSent = true
      try {
        let secret = await sock.requestPairingCode(userJid.split('@')[0])
        secret = secret.match(/.{1,4}/g)?.join("-") || secret
        
        await conn.sendMessage(m.chat, {
          text: `
🐉 *VINCULACIÓN POR CÓDIGO DE 8 DÍGITOS* 🐉

👾 *Pasos para vincularte a Gohan:*
1️⃣ Abre WhatsApp en tu teléfono  
2️⃣ Pulsa ⋮ *Más opciones* → *Dispositivos vinculados*  
3️⃣ Presiona *"Vincular un dispositivo"*  
4️⃣ Selecciona *"Con número"* e introduce el código:

🔑 *CÓDIGO:* ${secret}

⚡ *Gohan Beast - Poder Máximo Activado*
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al generar código:', e)
        await conn.reply(m.chat, '❌ Error al generar el código de vinculación.', m)
      }
      return
    }
    
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    
    if (connection === 'close') {
      if (reason === 428 || reason === 408 || reason === 500) {
        console.log(chalk.yellow(`🔄 Reconectando subbot: ${path.basename(pathYukiJadiBot)}`))
        await creloadHandler(true).catch(console.error)
      }
      if (reason === 405 || reason === 401) {
        console.log(chalk.red(`❌ Sesión cerrada: ${path.basename(pathYukiJadiBot)}`))
        fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
      }
      if (reason === 403) {
        console.log(chalk.red(`🚫 Cuenta en soporte: ${path.basename(pathYukiJadiBot)}`))
        fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
      }
    }
    
    if (global.db.data == null) loadDatabase()
    
    if (connection === 'open') {
      let userName = sock.authState.creds.me.name || 'Anónimo'
      let userJid = sock.authState.creds.me.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`
      
      console.log(chalk.green(`✅ Subbot conectado: ${userName} (${path.basename(pathYukiJadiBot)})`))
      
      sock.isInit = true
      
      // Verificar que no esté duplicado
      const yaExiste = global.conns.some(c => c.user?.jid === sock.user?.jid)
      if (!yaExiste) {
        global.conns.push(sock)
      }
      
      // NOTIFICAR AL DUEÑO QUE UN SUBBOT SE CONECTÓ
      try {
        await conn.sendMessage(m.chat, {
          text: `
🐉 *¡NUEVO SUBBOT CONECTADO!* 🐉

👤 *Usuario:* ${userName}
📱 *Número:* ${path.basename(pathYukiJadiBot)}
📅 *Fecha:* ${new Date().toLocaleString()}

⚡ El subbot está listo para usar.
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al notificar subbot:', e)
      }
      
      await joinChannels(sock)
    }
  }

  let handler = await import('../handler.js')
  let creloadHandler = async function (restatConn) {
    try {
      const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
      console.error('Error recargando handler:', e)
    }
    
    if (restatConn) {
      const oldChats = sock.chats
      try { sock.ws.close() } catch { }
      sock.ev.removeAllListeners()
      sock = makeWASocket(connectionOptions, { chats: oldChats })
      isInit = true
    }
    
    if (!isInit) {
      sock.ev.off("messages.upsert", sock.handler)
      sock.ev.off("connection.update", sock.connectionUpdate)
      sock.ev.off('creds.update', sock.credsUpdate)
    }

    sock.handler = handler.handler.bind(sock)
    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on("messages.upsert", sock.handler)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
    isInit = false
    return true
  }
  
  creloadHandler(false)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}