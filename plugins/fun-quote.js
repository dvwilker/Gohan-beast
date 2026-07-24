let handler = async (m, { conn }) => {
  const quotes = [
    "El poder no se mide por la fuerza, sino por la voluntad de proteger a los demás.",
    "Un guerrero siempre se levanta, sin importar cuántas veces caiga.",
    "El verdadero poder viene del corazón, no de los músculos.",
    "No importa cuánto te caigas, lo importante es que siempre te levantes.",
    "El miedo es solo una ilusión que desaparece cuando enfrentas tus límites.",
    "La verdadera fuerza no está en ganar, sino en nunca rendirse.",
    "El poder de un Saiyajin crece cuando protege a los que ama.",
    "No subestimes el poder de la determinación.",
    "El entrenamiento no solo fortalece el cuerpo, también el espíritu.",
    "Un guerrero nunca se rinde, incluso cuando todo parece perdido.",
    "El poder infinito nace de la voluntad infinita.",
    "Cada batalla te enseña algo nuevo sobre ti mismo.",
    "La verdadera fuerza está en saber cuándo luchar y cuándo proteger.",
    "El orgullo de un guerrero es su mayor fortaleza y su mayor debilidad.",
    "No importa el poder que tengas, sino cómo lo usas.",
    "El camino del guerrero es solitario, pero nunca estás solo.",
    "Cada caída es una oportunidad para levantarse más fuerte.",
    "La verdadera valentía es seguir adelante cuando tienes miedo.",
    "El poder no se da, se gana con esfuerzo y dedicación.",
    "Un verdadero guerrero protege a los débiles, no los domina."
  ]

  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  
  await conn.reply(m.chat, `
🐉 GOHAN BEAST — FRASE DEL GUERRERO

✍️ *"${quote}"*

⚡ *Gohan Beast - Poder Máximo Activado*
  `.trim(), m)
  await m.react('✍️')
}

handler.command = ['quote', 'frase', 'motivacion']
handler.tags = ['fun']
handler.help = ['quote']

export default handler