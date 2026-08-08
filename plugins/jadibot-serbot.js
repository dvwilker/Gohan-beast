const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion} = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`🐉 GOHAN BEAST - SUBBOT

Uso correcto:
${usedPrefix + command} <numero>

Ejemplo:
${usedPrefix + command} 584125877491

El numero debe ser sin espacios, sin + y sin @.
El subbot se vinculara a ese numero.`)
  }

  let numero = args[0].replace(/[^0-9]/g, '')
  if (numero.length < 10) {
    return m.reply(`Numero invalido. Debe tener al menos 10 digitos.`)
  }

  let pathYukiJadiBot = path.join(`./${global.jadi || 'JadiBots'}`, numero)
  
  if (!fs.existsSync(pathYukiJadiBot)){
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }
  
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length
  
  if (subBotsCount >= 30) {
    return m.reply(`No hay espacios disponibles para mas Sub-Bots. Limite: 30`)
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
    fromCommand: true,
    numero: numero
  }
  
  await yukiJadiBot(options)
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']

export default handler 

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command, isCode, isQR, numero } = options
  
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  
  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    conn.reply(m.chat, `Uso correcto: ${usedPrefix + command} <numero>`, m)
    return
  }

  let { version } = await fetchLatestBaileysVersion()
  const msgRetryCache = new NodeCache()
  const { state, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)

  const connectionOptions = {
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    auth: { 
      creds: state.creds, 
      keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
    },
    msgRetryCache,
    browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Gohan Beast SubBot', 'Chrome', '2.0.0'],
    version: version,
    generateHighQualityLinkPreview: true,
    defaultQueryTimeoutMs: undefined,
    keepAliveIntervalMs: 30000,
    connectTimeoutMs: 60000,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    patchMessageBeforeSending: false
  };

  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  let isInit = true
  let qrSent = false
  let codeSent = false
  let notificacionEnviada = false

  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    
    if (isNewLogin) sock.isInit = false
    
    if (qr && isQR && !qrSent) {
      qrSent = true
      const qrImage = await qrcode.toBuffer(qr, { scale: 8 })
      try {
        await conn.sendMessage(m.chat, { 
          image: qrImage, 
          caption: `
VINCULACION POR QR GOHAN BEAST

Escanea este QR con WhatsApp para vincular el subbot.

Numero: ${numero}

Gohan Beast - Poder Maximo Activado
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error enviando QR:', e.message)
      }
      return
    }
    
    if (isCode && !codeSent) {
      codeSent = true
      try {
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        let secret = await sock.requestPairingCode(numero)
        secret = secret.match(/.{1,4}/g)?.join("-") || secret
        
        await conn.sendMessage(m.chat, {
          text: `
CODIGO DE VINCULACION

CODIGO: ${secret}

Numero: ${numero}

Abre WhatsApp -> Dispositivos vinculados -> Con numero
Introduce este codigo para vincular el subbot.

Gohan Beast - Poder Maximo Activado
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al generar codigo:', e)
        try {
          await conn.reply(m.chat, `Error al generar el codigo para ${numero}. Usa .qr en su lugar.`, m)
        } catch {}
      }
      return
    }
    
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    
    if (connection === 'close') {
      if (reason === 428 || reason === 408 || reason === 500) {
        console.log(chalk.yellow(`Reconectando subbot: ${path.basename(pathYukiJadiBot)}`))
        setTimeout(() => creloadHandler(true).catch(console.error), 5000)
      }
      if (reason === 405 || reason === 401 || reason === 403) {
        console.log(chalk.red(`Sesion cerrada: ${path.basename(pathYukiJadiBot)}`))
        try {
          fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })
        } catch {}
        const index = global.conns.indexOf(sock)
        if (index > -1) {
          global.conns.splice(index, 1)
        }
      }
    }
    
    if (connection === 'open' && !notificacionEnviada) {
      notificacionEnviada = true
      let userName = sock.authState.creds.me.name || 'Anonimo'
      
      console.log(chalk.green(`Subbot conectado: ${userName} (${path.basename(pathYukiJadiBot)})`))
      
      sock.isInit = true
      
      const yaExiste = global.conns.some(c => c.user?.jid === sock.user?.jid)
      if (!yaExiste) {
        global.conns.push(sock)
      }
      
      try {
        await conn.sendMessage(m.chat, {
          text: `
SUBBOT CONECTADO

Usuario: ${userName}
Numero: ${path.basename(pathYukiJadiBot)}
Fecha: ${new Date().toLocaleString()}

El subbot esta listo.
          `.trim()
        }, { quoted: m })
      } catch (e) {
        console.error('Error al notificar subbot:', e)
      }
      
      await joinChannels(sock)
    }
  }

  let handlerMod = await import('../handler.js')
  let creloadHandler = async function (restatConn) {
    try {
      const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handlerMod = Handler
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

    sock.handler = handlerMod.handler.bind(sock)
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

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch || {})) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}