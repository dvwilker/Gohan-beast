import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const notesFile = path.resolve(__dirname, '../database/notes.json')

function readNotes() {
  try {
    if (!fs.existsSync(notesFile)) {
      fs.writeFileSync(notesFile, JSON.stringify({}))
    }
    return JSON.parse(fs.readFileSync(notesFile))
  } catch {
    return {}
  }
}

function saveNotes(data) {
  fs.writeFileSync(notesFile, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text, command }) => {
  const userId = m.sender

  if (command === 'remember') {
    if (!text) {
      return conn.reply(m.chat, `
🐉 GOHAN BEAST — GUARDAR NOTA

📌 Uso: .remember <nota>
📌 Ejemplo: .remember Mi cumpleaños es el 15 de agosto
      `.trim(), m)
    }

    const notes = readNotes()
    if (!notes[userId]) notes[userId] = []
    notes[userId].push({
      text: text,
      date: new Date().toLocaleString()
    })
    saveNotes(notes)

    await conn.reply(m.chat, `
🐉 GOHAN BEAST — NOTA GUARDADA

✅ Nota guardada exitosamente.

📌 *Contenido:* ${text}

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
    await m.react('📝')
  }

  if (command === 'mynotes') {
    const notes = readNotes()
    const userNotes = notes[userId] || []

    if (userNotes.length === 0) {
      return conn.reply(m.chat, '📭 No tienes notas guardadas.', m)
    }

    const list = userNotes.map((note, i) => 
      `┃ ${i + 1}. ${note.text} (${note.date})`
    ).join('\n')

    await conn.reply(m.chat, `
🐉 GOHAN BEAST — MIS NOTAS

${list}

📌 *Total:* ${userNotes.length} notas

⚡ *Gohan Beast - Poder Máximo Activado*
    `.trim(), m)
    await m.react('📝')
  }
}

handler.command = ['remember', 'mynotes']
handler.tags = ['tools']
handler.help = ['remember <texto>', 'mynotes']

export default handler