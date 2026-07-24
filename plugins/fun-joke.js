let handler = async (m, { conn }) => {
  const jokes = [
    "¿Qué le dice un techo a otro techo?... Techo de menos 🏠",
    "¿Cómo se llama el campeón de buceo japonés?... Tokofondo 🇯🇵",
    "¿Qué hace una abeja en el gimnasio?... Zumba 🐝",
    "¿Cómo se llama el primo de Bruce Lee?... Broco Lee 🥦",
    "¿Qué le dijo un gato a otro gato?... ¿Miau? 😺",
    "¿Qué es un pez torpe?... Un pezque 🐟",
    "¿Qué hace un perro con un taladro?... Perforrando 🐕",
    "¿Cómo se llama el hermano de la vaca?... Hermano 🐄",
    "¿Qué le dijo un huevo a otro huevo?... ¡Huevos! 🥚",
    "¿Cómo se dice 'dinero' en chino?... Chin-chin 💰",
    "¿Qué hace un pato con una pistola?... ¡Pato-pum! 🦆",
    "¿Cómo se llama el miedo de un perro?... Miedo-pio 🐕",
    "¿Qué le dijo un semáforo a otro?... No me mires, estoy cambiando 🚦",
    "¿Cómo se llama el celular de un elefante?... Teléfante 📱",
    "¿Qué hace un músico en el baño?... Do-re-mi-fa-sol-la-si 🎵",
    "¿Cómo se llama el médico de los fantasmas?... Dr. Fantasme 👻",
    "¿Qué le dijo un lápiz a otro lápiz?... ¡No me dibujes! ✏️",
    "¿Cómo se llama el pájaro que siempre anda triste?... Aves-tristes 🐦",
    "¿Qué hace un oso en el supermercado?... Comprando osos 🐻",
    "¿Cómo se llama el héroe que siempre llega tarde?... El Super-tarde 🦸‍♂️",
    "¿Qué le dijo un beso a otro beso?... ¡Nos vemos en boca! 😘",
    "¿Cómo se llama el miedo de un pan?... Pan-demonio 🍞",
    "¿Qué hace una nube en el cielo?... Nube-ando ☁️",
    "¿Cómo se llama el perro que no ladra?... Perro-calla 🐕",
    "¿Qué le dijo un calcetín a otro calcetín?... ¡Nos están buscando! 🧦",
    "¿Cómo se llama el pez que siempre está enojado?... Pescado-ido 🐟",
    "¿Qué hace un astronauta en el baño?... Orbitando 🚀",
    "¿Cómo se llama el miedo de un tomate?... Tomate-miedo 🍅",
    "¿Qué le dijo una silla a otra silla?... ¡Nos están desarmando! 🪑",
    "¿Cómo se llama el perro que se cayó de un piso?... Dog-ado 🐕",
    "¿Qué hace un payaso en el consultorio?... Risa-terapia 🤡",
    "¿Cómo se llama el miedo de un espejo?... Espejo-fobia 🪞",
    "¿Qué le dijo un disco a otro disco?... ¡No me rayés! 💿",
    "¿Cómo se llama el perro que es abogado?... Perro-gado 🐕",
    "¿Qué hace un elefante en el water?... Gluglú 🐘",
    "¿Cómo se llama el miedo de un cohete?... Cohete-fobia 🚀",
    "¿Qué le dijo un cuadro a otro cuadro?... ¡No me enmarques! 🖼️",
    "¿Cómo se llama el perro que toca piano?... Perro-cuello 🐕",
    "¿Qué hace un león en el supermercado?... Leono-ando 🦁",
    "¿Cómo se llama el miedo de una puerta?... Puerta-fobia 🚪",
    "¿Qué le dijo un espejo a otro espejo?... ¡No me reflejes! 🪞",
    "¿Cómo se llama el perro que es astronauta?... Perro-spacial 🐕",
    "¿Qué hace una rana en la nevera?... Rana-rando 🐸",
    "¿Cómo se llama el miedo de un teléfono?... Teléfono-fobia 📞",
    "¿Qué le dijo un libro a otro libro?... ¡No me leas! 📖",
    "¿Cómo se llama el perro que es bombero?... Perro-mero 🐕",
    "¿Qué hace una abeja en la piscina?... Abeja-ndo 🐝",
    "¿Cómo se llama el miedo de una silla?... Silla-fobia 🪑",
    "¿Qué le dijo una ventana a otra ventana?... ¡No me mirés! 🪟"
  ]

  const joke = jokes[Math.floor(Math.random() * jokes.length)]
  
  await conn.reply(m.chat, `
🐉 *GOHAN BEAST — CHISTE* 🐉

${joke}

😆 *Que el humor te acompañe guerrero*
  `.trim(), m)
  await m.react('😂')
}

handler.command = ['joke', 'chiste', 'broma']
handler.tags = ['fun']
handler.help = ['joke']

export default handler