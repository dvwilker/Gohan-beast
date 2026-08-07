import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function before(m, { conn }) {
  try {
    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = null

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot en rcanal:', err)
      }
    }

    let imagenLocal = null
    const imagePath = path.join(__dirname, 'lib', 'gohan.jpg')
    if (fs.existsSync(imagePath)) {
      imagenLocal = fs.readFileSync(imagePath)
    }

    const canales = [global.idcanal, global.idcanal2]
    const newsletterJidRandom = canales[Math.floor(Math.random() * canales.length)]

    global.rcanal = {
      contextInfo: {
        isForwarded: false,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJidRandom,
          serverMessageId: 100,
          newsletterName: nombreBot,
        },
        externalAdReply: {
          title: nombreBot,
          body: global.author,
          thumbnail: imagenLocal,
          sourceUrl: 'api-gohan-v1.onrender.com',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }
  } catch (e) {
    console.log('Error al generar rcanal:', e)
  }
}