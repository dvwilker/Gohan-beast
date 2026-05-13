import { isPremium } from '../../database/premium.js';

let handler = async (m, { conn, text }) => {
    const userId = m.sender.split('@')[0];
    
    // Verificar si es premium
    if (!isPremium(userId)) {
        return m.reply(`❌ *ACCESO DENEGADO*\n\nEste comando es exclusivo para usuarios *PREMIUM*.\n\n✨ *Beneficios premium:*\n• Comandos exclusivos\n• Descargas ilimitadas\n• Mayor velocidad\n\n💎 *Obtén premium:* Contacta al propietario @${global.owner[0]}`, null, { mentions: [global.owner[0] + '@s.whatsapp.net'] });
    }
    
    // Aquí va el código del comando premium
    // Ejemplo:
    await m.reply(`✨ *COMANDO PREMIUM*\n\n✅ ¡Bienvenido usuario premium @${userId}!\n\n🎁 Aquí tienes acceso a contenido exclusivo.\n\n> 🌟 ¡Disfruta de tus beneficios!`, null, { mentions: [m.sender] });
};

handler.help = ['cmdpremium'];
handler.tags = ['beast'];
handler.command = /^(cmdpremium)$/i;

export default handler;