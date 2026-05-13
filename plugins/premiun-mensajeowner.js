let handler = async (m, { conn }) => {
    const ownerNumber = '5492644138998';
    const ownerJid = ownerNumber + '@s.whatsapp.net';
    
    let caption = `📞 *CONTACTO DEL OWNER*

╔══════════════════════════╗
║ 👑 *GOHAN BEAST - OWNER*  ║
╠══════════════════════════╣
║ 📱 *WhatsApp:* wa.me/${ownerNumber}
║ 💬 *Estado:* Activo 24/7
║ 🐉 *Bot:* Gohan Beast V1
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━

*📝 PARA CONSULTAS:*

▸ 💎 *Premium:* Precios y formas de pago
▸ ❓ *Dudas:* Funcionamiento del bot
▸ 🐛 *Reportes:* Errores o bugs
▸ 💡 *Sugerencias:* Mejoras para el bot

━━━━━━━━━━━━━━━━━━━━━━━━━

*📋 MENSAJE SUGERIDO:*

\`\`\`
Hola, me gustaría más información sobre el sistema premium de Gohan Beast V1.

📌 Interesado en: [PayPal/Diamantes FF]
💰 Presupuesto: [cantidad]
💬 Consulta: [tu pregunta]
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *RESPONDEMOS EN:*
▸ Premium: 5-30 minutos
▸ Consultas: 1-2 horas
▸ Reportes: 30 minutos

> 🐉 *¡El poder de un Saiyajin te espera!* 🐉

✨ *Haz clic en el número para contactar* ✨`;

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: '📞 CONTACTO GOHAN BEAST',
                body: '¡Activa tu poder máximo!',
                thumbnail: null,
                mediaType: 1,
                renderLargerThumbnail: true
            },
            mentionedJid: [ownerJid]
        }
    });
    
    // Enviar botón de contacto (si soporta)
    await conn.sendMessage(m.chat, {
        text: `🔘 *Haz clic aquí para contactar al owner:* 👇\n\nhttps://wa.me/${ownerNumber}?text=Hola%20me%20gustaría%20más%20información%20sobre%20el%20sistema%20premium%20de%20Gohan%20beast%20V1`
    });
};

handler.help = ['owner', 'contacto'];
handler.tags = ['premium'];
handler.command = /^(owner|contacto|dudas|soporte)$/i;

export default handler;