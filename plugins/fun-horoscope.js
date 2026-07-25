let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `
🐉 GOHAN BEAST — HORÓSCOPO

⚡ Consulta tu horóscopo diario.

📌 Uso: .horoscopo <signo>
📌 Ejemplo: .horoscopo aries

📌 Signos: aries, tauro, geminis, cancer, leo, virgo, libra, escorpio, sagitario, capricornio, acuario, piscis
    `.trim(), m)
  }

  const signos = {
    aries: '♈ Aries',
    tauro: '♉ Tauro',
    geminis: '♊ Géminis',
    cancer: '♋ Cáncer',
    leo: '♌ Leo',
    virgo: '♍ Virgo',
    libra: '♎ Libra',
    escorpio: '♏ Escorpio',
    sagitario: '♐ Sagitario',
    capricornio: '♑ Capricornio',
    acuario: '♒ Acuario',
    piscis: '♓ Piscis'
  }

  const signo = text.toLowerCase().trim()
  if (!signos[signo]) {
    return conn.reply(m.chat, '❌ Signo inválido. Usa: aries, tauro, geminis, cancer, leo, virgo, libra, escorpio, sagitario, capricornio, acuario, piscis', m)
  }

  const mensajes = [
    'Hoy es un gran día para tomar decisiones importantes. Confía en tu intuición.',
    'El amor te sonríe hoy. Aprovecha para conectar con tus seres queridos.',
    'Tu energía está en su punto más alto. Es momento de enfrentar nuevos desafíos.',
    'La paciencia será tu mejor aliada hoy. Las cosas llegarán a su debido tiempo.',
    'Un viejo amigo podría contactarte hoy. Será un reencuentro agradable.',
    'Hoy es un día para reflexionar y planificar tu futuro. Tómate tu tiempo.',
    'La suerte está de tu lado. Atrévete a tomar riesgos calculados.',
    'Tu creatividad estará a flor de piel. Aprovecha para expresarte.',
    'Hoy es un buen día para empezar algo nuevo. No tengas miedo al cambio.',
    'La comunicación será clave hoy. Habla con claridad y escucha con atención.'
  ]

  const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)]

  await conn.reply(m.chat, `
🐉 GOHAN BEAST — HORÓSCOPO

${signos[signo]}

📌 *Predicción del día:*
${mensaje}

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('⭐')
}

handler.command = ['horoscopo', 'horóscopo', 'signo']
handler.tags = ['fun']
handler.help = ['horoscopo <signo>']

export default handler