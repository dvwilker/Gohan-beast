import { addPremium, getPremiumInfo } from '../../database/premium.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Solo owner puede usar este comando
    if (!global.owner.includes(m.sender.split('@')[0]) && !m.isOwner) {
        return m.reply('❌ *Acceso Denegado*\n\nEste comando solo puede ser usado por el *Propietario* del bot.');
    }
    
    if (!text) return m.reply(`✨ *Sistema Premium*\n\nUso correcto:\n${usedPrefix + command} @usuario días\n\nEjemplo:\n${usedPrefix + command} @user 15`);
    
    let user = m.mentionedJid[0] || text.split(' ')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    let days = parseInt(text.split(' ')[1]);
    
    if (!user) return m.reply('❌ Menciona al usuario o envía su número.');
    if (!days || isNaN(days)) return m.reply('❌ Especifica los días. Ejemplo: 15');
    if (days < 1) return m.reply('❌ Los días deben ser mayor a 0.');
    
    // Agregar premium
    const result = addPremium(user.split('@')[0], days, m.sender.split('@')[0]);
    
    // Obtener info actualizada
    const info = getPremiumInfo(user.split('@')[0]);
    
    let caption = `🌟 *SISTEMA PREMIUM* 🌟\n\n`;
    caption += `✅ *Premium Activado*\n\n`;
    caption += `👤 *Usuario:* @${user.split('@')[0]}\n`;
    caption += `📅 *Días:* ${days}\n`;
    caption += `⏰ *Expira:* ${info.expiredIn}\n`;
    caption += `👑 *Otorgado por:* @${m.sender.split('@')[0]}\n\n`;
    caption += `> ✨ ¡El usuario ahora tiene acceso a comandos exclusivos! ✨`;
    
    await conn.sendMessage(m.chat, {
        text: caption,
        mentions: [user, m.sender]
    });
    
    // Opcional: Enviar mensaje privado al usuario
    await conn.sendMessage(user, {
        text: `🎉 *¡FELICIDADES!* 🎉\n\nHas recibido *${days} días* de *Premium* en el bot.\n\n⏰ Tu premium expira el: ${info.expiredIn}\n\n✨ Disfruta de comandos exclusivos ✨`
    });
};

handler.help = ['addprem @user días'];
handler.tags = ['owner'];
handler.command = /^(addprem|agregarprem|giveprem)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;