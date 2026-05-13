import { addPremium, getPremiumInfo } from '../../database/premium.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Solo owner puede confirmar pagos
    const isOwner = global.owner ? global.owner.includes(m.sender.split('@')[0]) : false;
    if (!isOwner && !m.isOwner) {
        return m.reply('❌ *ACCESO DENEGADO*\n\nSolo el owner puede confirmar pagos.');
    }
    
    if (!text) return m.reply(`🔑 *CONFIRMAR PAGO PREMIUM*

Uso: ${usedPrefix + command} <código>

Ejemplo: ${usedPrefix + command} ABC123XYZ

> Los códigos se generan cuando un usuario solicita premium`);
    
    const codigo = text.toUpperCase();
    
    if (!global.pendingPremiums || !global.pendingPremiums[codigo]) {
        return m.reply(`❌ *CÓDIGO INVÁLIDO*

El código "${codigo}" no existe o ya fue usado.

📋 *Solicitudes pendientes:*
${global.pendingPremiums ? Object.keys(global.pendingPremiums).map(k => `▸ ${k} - @${global.pendingPremiums[k].userId}`).join('\n') : '▸ No hay solicitudes'}`);
    }
    
    const solicitud = global.pendingPremiums[codigo];
    const userId = solicitud.userId;
    const days = solicitud.days;
    
    // Agregar premium
    addPremium(userId, days, m.sender.split('@')[0]);
    
    const info = getPremiumInfo(userId);
    
    // Mensaje de confirmación
    let confirmMsg = `✅ *PAGO CONFIRMADO - PREMIUM ACTIVADO*

╔════════════════════════╗
║ 👤 *Usuario:* @${userId}
║ 📅 *Días otorgados:* ${days}
║ ⏰ *Expira:* ${info.expiredIn}
║ 👑 *Activado por:* @${m.sender.split('@')[0]}
╚════════════════════════╝

🐉 *¡El poder GOHAN BEAST ha sido despertado!* 🐉

✨ *Beneficios activados:*
▸ Comandos exclusivos
▸ Descargas ilimitadas
▸ Mayor velocidad
▸ Prioridad en el bot`;

    await conn.sendMessage(m.chat, {
        text: confirmMsg,
        mentions: [userId + '@s.whatsapp.net', m.sender]
    });
    
    // Notificar al usuario
    await conn.sendMessage(userId + '@s.whatsapp.net', {
        text: `🎉 *¡PREMIUM ACTIVADO!* 🎉

╔══════════════════════╗
║ 🐉 *GOHAN BEAST MODE*     ║
║ ⭐ *Premium Activado*      ║
║ 📅 *Días:* ${days}         ║
║ ⏰ *Expira:* ${info.expiredIn}
╚═══════════════════════╝

✨ *¡Disfruta de todos los beneficios premium!*

> Usa .preminfo para ver tu estado
> Usa .tienda para ver más planes

🐉 *¡Gracias por confiar en GOHAN BEAST!* 🐉`
    }).catch(() => {});
    
    // Eliminar solicitud pendiente
    delete global.pendingPremiums[codigo];
    
    // Limpiar solicitudes viejas (más de 24 horas)
    const now = Date.now();
    for (const [code, data] of Object.entries(global.pendingPremiums)) {
        if (now - data.timestamp > 24 * 60 * 60 * 1000) {
            delete global.pendingPremiums[code];
        }
    }
};

handler.help = ['confirmar <código>'];
handler.tags = ['owner'];
handler.command = /^(confirmar|activarprem|confirmprem)$/i;
handler.rowner = true;
handler.owner = true;

export default handler;