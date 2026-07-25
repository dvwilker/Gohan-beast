let handler = async (m, { conn }) => {
  const riddles = [
    { pregunta: 'Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.', respuesta: 'pera' },
    { pregunta: 'Oro parece, plata no es. ¿Qué es?', respuesta: 'plátano' },
    { pregunta: 'Tiene ojos pero no ve, tiene boca pero no habla. ¿Qué es?', respuesta: 'aguja' },
    { pregunta: 'Cuanto más grande es, menos se ve. ¿Qué es?', respuesta: 'la oscuridad' },
    { pregunta: 'Vuela sin alas, llora sin ojos. ¿Qué es?', respuesta: 'nube' },
    { pregunta: 'Tiene corona pero no es rey, tiene espinas pero no es rosa. ¿Qué es?', respuesta: 'cardo' },
    { pregunta: 'Cuanto más se seca, más moja. ¿Qué es?', respuesta: 'toalla' },
    { pregunta: 'Tiene dientes pero no come, tiene cabeza pero no piensa. ¿Qué es?', respuesta: 'peine' },
    { pregunta: 'Camina sin pies, corre sin piernas. ¿Qué es?', respuesta: 'viento' },
    { pregunta: 'Tiene agujas pero no cose, tiene números pero no cuenta. ¿Qué es?', respuesta: 'reloj' },
    { pregunta: 'Cuelga en la pared, pero no es un cuadro. Marca las horas, pero no tiene manos. ¿Qué es?', respuesta: 'reloj de pared' }
  ]

  const riddle = riddles[Math.floor(Math.random() * riddles.length)]
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — ADIVINANZA

❓ *Adivinanza:*
${riddle.pregunta}

💡 *Respuesta:* ${riddle.respuesta}

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('🧠')
}

handler.command = ['riddle', 'adivinanza']
handler.tags = ['fun']
handler.help = ['riddle']

export default handler