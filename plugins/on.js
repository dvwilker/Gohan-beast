import fetch from 'node-fetch'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.')

  // ✅ Usar isAdmin del handler (ya arreglado)
  if (!isAdmin && !isOwner) {
    return m.reply('❌ Solo admins pueden activar o desactivar funciones.')
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'antiarabe', 'modoadmin'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on antiarabe* / *.off antiarabe*\n*.on modoadmin* / *.off modoadmin*`)
  }

  if (type === 'antilink') {
    chat.antilink = enable
    if(!chat.antilinkWarns) chat.antilinkWarns = {}
    if(!enable) chat.antilinkWarns = {}
    return m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'antiarabe') {
    chat.antiarabe = enable
    return m.reply(`✅ Antiarabe ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'modoadmin') {
    chat.modoadmin = enable
    return m.reply(`✅ Modo Admin ${enable ? 'activado' : 'desactivado'}.`)
  }
}

handler.command = ['on', 'off']
handler.group = true
handler.register = false
handler.tags = ['group']
handler.help = ['on antilink', 'off antilink', 'on antiarabe', 'off antiarabe', 'on modoadmin', 'off modoadmin']

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants || []

  const isUserAdmin = participants.some(p => {
    const pid = p.id || p.jid || ''
    return pid === m.sender && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
  })

  const isBotAdmin = participants.some(p => {
    const pid = p.id || p.jid || ''
    return pid === conn.user.jid && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true)
  })

  if (chat.modoadmin) {
    if (!isUserAdmin && !m.fromMe) return
  }

  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    const number = newJid.split('@')[0].replace(/\D/g, '')
    const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab && isBotAdmin) {
      await conn.sendMessage(m.chat, { text: `🚫 @${newJid.split('@')[0]} será expulsado. [Anti Arabe Activado]`, mentions: [newJid] })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  if (chat.antilink) {
    const text = m?.text || ''

    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch {}

      if (!chat.antilinkWarns) chat.antilinkWarns = {}
      if (!chat.antilinkWarns[m.sender]) chat.antilinkWarns[m.sender] = 0

      chat.antilinkWarns[m.sender]++

      if (chat.antilinkWarns[m.sender] < 3) {
        try {
          await conn.sendMessage(m.chat, {
            text: `🚫 Hey ${userTag}, no se permiten links aquí. Advertencia ${chat.antilinkWarns[m.sender]}/3.`,
            mentions: [m.sender]
          }, { quoted: m })

          await conn.sendMessage(m.chat, {
            delete: {
              remoteJid: m.chat,
              fromMe: false,
              id: msgID,
              participant: delet
            }
          })
        } catch {
          await conn.sendMessage(m.chat, {
            text: `⚠️ No pude eliminar el mensaje de ${userTag}.`,
            mentions: [m.sender]
          }, { quoted: m })
        }
      } else {
        if (isBotAdmin) {
          try {
            await conn.sendMessage(m.chat, {
              text: `🚫 ${userTag} alcanzó 3 advertencias. Serás expulsado.`,
              mentions: [m.sender]
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
              delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: msgID,
                participant: delet
              }
            })

            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            chat.antilinkWarns[m.sender] = 0
          } catch {
            await conn.sendMessage(m.chat, {
              text: `⚠️ No pude expulsar a ${userTag}.`,
              mentions: [m.sender]
            }, { quoted: m })
          }
        } else {
          await conn.sendMessage(m.chat, {
            text: `⚠️ No puedo expulsar, necesito ser admin.`,
            mentions: [m.sender]
          }, { quoted: m })
        }
      }
      return true
    }
  }
}

export default handler