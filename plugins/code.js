import makeWASocket, { 
  useMultiFileAuthState 
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'

const subsaiyanPath = path.resolve('./subsaiyan')

// Asegurar que existe la carpeta subsaiyan
if (!fs.existsSync(subsaiyanPath)) fs.mkdirSync(subsaiyanPath, { recursive: true })

// === COMANDO .CODE ===
const codeHandler = async (m, { conn }) => {
  const message = `
╭━━━〔 *SUBBOT CONNECTION* 〕━━━┈ 🔗
┃
┃ 📌 *Instrucciones para conectar SubBot:*
┃
┃ 1️⃣ Usa el comando */.qr*
┃ 2️⃣ Escanea el código QR
┃ 3️⃣ Espera a que se conecte
┃
┃ 📁 *Los subbots se guardan en:* 
┃ \`./subsaiyan/\`
┃
┃ ⚠️ *Cada subbot tendrá su propia carpeta*
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━┈ 🚀
`
  await conn.sendMessage(m.chat, { text: message }, { quoted: m })
}

// === COMANDO .QR ===
const qrHandler = async (m, { conn }) => {
  const sessionId = `subsaiyan_${Date.now()}`
  const sessionPath = path.join(subsaiyanPath, sessionId)
  
  // Crear carpeta para este subbot
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })
  
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  
  const subbot = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['SubSaiyan', 'Chrome', '1.0.0']
  })
  
  subbot.ev.on('connection.update', async (update) => {
    const { connection, qr } = update
    
    if (qr) {
      const qrBuffer = await qrcode.toBuffer(qr)
      await conn.sendMessage(m.chat, {
        image: qrBuffer,
        caption: `📱 *ESCANEA ESTE QR*\n\n🔹 Para conectar SubBot\n🔹 Se guardará en: subsaiyan/${sessionId}\n\n⚠️ QR válido por 60 segundos`
      })
    }
    
    if (connection === 'open') {
      await conn.sendMessage(m.chat, {
        text: `✅ *SUBBOT CONECTADO*\n\n📁 Carpeta: ${sessionId}\n🤖 Nombre: ${subbot.user.name}\n📱 Número: ${subbot.user.jid}`
      })
    }
  })
  
  subbot.ev.on('creds.update', saveCreds)
}

// === COMANDO .SUBBOTS ===
const listSubbotsHandler = async (m, { conn }) => {
  const folders = fs.readdirSync(subsaiyanPath).filter(f => 
    fs.statSync(path.join(subsaiyanPath, f)).isDirectory()
  )
  
  if (folders.length === 0) {
    return await conn.sendMessage(m.chat, { 
      text: `📭 *No hay subbots conectados*\n\nUsa *.qr* para conectar uno.`
    })
  }
  
  let message = `╭━━━〔 *SUBBOTS CONECTADOS* 〕━━━┈ 🤖\n┃\n`
  folders.forEach((folder, index) => {
    message += `┃ ${index + 1}. 📁 \`${folder}\`\n┃\n`
  })
  message += `╰━━━━━━━━━━━━━━━━━━━━━━━━━┈ 🔗`
  
  await conn.sendMessage(m.chat, { text: message })
}

// === COMANDO .REMOVE ===
const removeSubbotHandler = async (m, { conn, args }) => {
  const folderName = args[0]
  if (!folderName) {
    return await conn.sendMessage(m.chat, { 
      text: `⚠️ *Uso:* .remove <nombre_carpeta>\n\nUsa *.subbots* para ver las carpetas.`
    })
  }
  
  const folderPath = path.join(subsaiyanPath, folderName)
  
  if (!fs.existsSync(folderPath)) {
    return await conn.sendMessage(m.chat, { 
      text: `❌ *Subbot no encontrado:* ${folderName}`
    })
  }
  
  // Eliminar carpeta recursivamente
  fs.rmSync(folderPath, { recursive: true, force: true })
  
  await conn.sendMessage(m.chat, { 
    text: `✅ *Subbot eliminado*\n📁 Carpeta: ${folderName}`
  })
}

// === HANDLER PRINCIPAL ===
const handler = async (m, { conn, command, args }) => {
  switch(command) {
    case 'code':
      await codeHandler(m, { conn })
      break
    case 'qr':
      await qrHandler(m, { conn })
      break
    case 'subbots':
      await listSubbotsHandler(m, { conn })
      break
    case 'remove':
      await removeSubbotHandler(m, { conn, args })
      break
  }
}

handler.command = ['code', 'qr', 'subbots', 'remove']
handler.tags = ['tools']
handler.help = ['code', 'qr', 'subbots', 'remove <carpeta>']

export default handler