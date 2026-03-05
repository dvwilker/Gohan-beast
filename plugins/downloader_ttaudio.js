import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const emoji = "⚡";

    if (!args[0]) {
        return conn.reply(m.chat, 
            `*GOHAN BEAST BOT - TIKTOK AUDIO*\n\n` +
            `*Uso:* ${usedPrefix + command} <enlace_tiktok>\n` +
            `*Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZM6UHJYtE/\n\n` +
            `*🎵 Descarga el audio del video de TikTok*`,
        m);
    }

    try {
        await m.react('⏳');

        let tiktokData;

        // Intentar con la primera API
        try {
            tiktokData = await tiktokdl(args[0]);
        } catch (error) {
            console.log('API 1 falló, intentando API 2...');
            tiktokData = await tiktokdl2(args[0]);
        }

        // Verificar si tenemos datos válidos de alguna API
        if (!tiktokData) {
            await m.react('❌');
            return conn.reply(m.chat, '❌ No se pudo obtener datos del video', m);
        }

        let result;

        // Procesar según la API que respondió
        if (tiktokData.code === 0 && tiktokData.data) {
            // Estructura de la primera API (tikwm)
            result = tiktokData.data;
        } else if (tiktokData.status === 200 && tiktokData.result) {
            // Estructura de la segunda API (adonix)
            result = tiktokData.result;
        } else {
            await m.react('❌');
            return conn.reply(m.chat, '❌ Formato de datos no reconocido', m);
        }

        // Obtener la URL del audio
        // Para tikwm: music o soundUrl
        // Para adonix: url_audio o audioUrl
        const audioUrl = result.music || result.soundUrl || result.url_audio || result.audioUrl;

        if (!audioUrl) {
            await m.react('❌');
            return conn.reply(m.chat, '❌ No se pudo obtener el enlace del audio', m);
        }

        // Crear caption con datos disponibles
        const caption = 
            `*🎵 GOHAN BEAST BOT - TIKTOK AUDIO 🎵*\n\n` +
            `*Título:* ${result.title || result.desc || 'Sin título'}\n` +
            `*Autor:* ${result.author?.nickname || result.nickname || result.author || 'Desconocido'}\n` +
            `*Duración:* ${result.duration || 0}s\n` +
            `*Vistas:* ${result.play_count || result.playCount || result.viewCount || 0}\n` +
            `*Me gusta:* ${result.digg_count || result.likeCount || 0}\n` +
            `*Comentarios:* ${result.comment_count || result.commentCount || 0}\n\n` +
            `*🎵 Audio descargado con éxito*`;

        // Enviar el audio en lugar del video
        await conn.sendFile(m.chat, audioUrl, 'gohan_tiktok_audio.mp3', caption, m, null, {
            mimetype: 'audio/mpeg',
            asDocument: false
        });
        
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        return conn.reply(m.chat, '❌ Error al descargar: ' + e.message, m);
    }
};

handler.help = ['tiktokaudio'].map(v => v + ' <enlace>');
handler.tags = ['descargas'];
handler.command = ['tiktokaudio', 'tta', 'tiktokmp3', 'ttaudio'];
handler.group = true;
handler.register = false;

export default handler;

// Primera API
async function tiktokdl(url) {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(api);
    if (!res.ok) throw new Error(`API 1 error: ${res.status}`);
    return await res.json();
}

// Segunda API con tu clave personalizada
async function tiktokdl2(url) {
    const apiKey = 'KEYGOHANBOT'; // Tu clave aquí
    const api = `https://api-adonix.ultraplus.click/download/tiktok?apikey=${apiKey}&url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    if (!res.ok) throw new Error(`API 2 error: ${res.status}`);
    return await res.json();
}