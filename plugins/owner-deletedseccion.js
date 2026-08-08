import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply(`🐉 GOHAN BEAST - ACCESO DENEGADO

Solo el dueño puede eliminar sesiones de subbots.`)
  }

  if (!args[0]) {
    return m.reply(`🐉 GOHAN BEAST - ELIMINAR SESION

Uso correcto:
${usedPrefix + command} <numero>

Ejemplo:
${usedPrefix + command} 584125877491

El numero debe ser sin espacios, sin + y sin @.
Se eliminara la sesion del subbot y se desconectara.`)
  }

  let numero = args[0].replace(/[^0-9]/g, '')
  if (numero.length < 10) {
    return m.reply(`Numero invalido. Debe tener al menos 10 digitos.`)
  }

  let pathYukiJadiBot = path.join(`./${global.jadi || 'JadiBots'}`, numero)
  let userJid = numero + '@s.whatsapp.net'

  if (!fs.existsSync(pathYukiJadiBot)) {
    return m.reply(`No existe sesion para el numero ${numero}.`)
  }

  try {
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    
    let subbotEncontrado = false
    for (let i = 0; i < global.conns.length; i++) {
      const connSub = global.conns[i]
      if (connSub.user && connSub.user.jid === userJid) {
        try {
          connSub.ws.close()
        } catch {}
        global.conns.splice(i, 1)
        subbotEncontrado = true
        break
      }
    }

    fs.rmSync(pathYukiJadiBot, { recursive: true, force: true })

    let mensaje = `
SESION ELIMINADA

Numero: ${numero}
Usuario: ${userJid}

La sesion ha sido eliminada correctamente.
${subbotEncontrado ? 'El subbot ha sido desconectado.' : 'No habia subbot activo, solo se elimino la carpeta.'}

Gohan Beast - Poder Maximo Activado`

    await m.reply(mensaje)
    await m.react('🗑️')

  } catch (e) {
    console.error('Error eliminando sesion:', e)
    m.reply(`Error al eliminar la sesion: ${e.message}`)
  }
}

handler.help = ['deleted']
handler.tags = ['owner']
handler.command = ['deleted', 'deletesession', 'eliminarsession']
handler.rowner = true

export default handler