import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

let handler = async (m, { conn }) => {
    const pluginsPath = './plugins'
    let report = []
    let files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))

    for (let file of files) {
        try {
            // Intentar importar el plugin como módulo ES
            await import(pathToFileURL(path.join(pluginsPath, file)).href)
            report.push(`🐉 ${file} → Sin errores`)
        } catch (err) {
            report.push(`🌀 ${file} → ${err.message}`)
        }
    }

    if (!report.length) return m.reply('📂 No se encontraron plugins para revisar 🐉.')

    m.reply(`📋 *Revisión de plugins Beast 🌀:*\n\n${report.join('\n')}`)
}

handler.command = /^checkplugins$/i
handler.help = ['checkplugins']
handler.tags = ['owner']
handler.rowner = true // solo owner

export default handler