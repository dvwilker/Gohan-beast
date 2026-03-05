import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, 
            `*GOHAN BEAST BOT - TIKTOK AUDIO*\n\n` +
            `*Uso:* ${usedPrefix + command} <enlace_tiktok>\n` +
            `*Ejemplo:* ${usedPrefix + command} https://vm.tiktok.com/ZM6UHJYtE/`,
        m);
    }

    try {
        await m.react('⏳');

        // Mostrar mensaje de espera
        await conn.reply(m.chat, '🔄 Descargando audio de TikTok...', m);

        // Usar API de https://tikdown.org/
        const url = args[0];
        const apiUrl = `https://api.tikmate.cc/api?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status) {
            throw new Error('No se pudo obtener el audio');
        }

        // Construir URL del audio
        // TikMate a veces devuelve la URL del audio en data.music o data.audio
        let audioUrl = data.music || data.audio;
        
        if (!audioUrl && data.video_id) {
            // Alternativa: construir URL del audio manualmente
            audioUrl = `https://tikmate.cc/download/audio/${data.video_id}`;
        }

        if (!audioUrl) {
            throw new Error('No se encontró URL de audio');
        }

        // Descargar el audio primero para asegurar que existe
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error('El audio no está disponible');
        }

        const audioBuffer = await audioResponse.buffer();

        // Crear caption simple
        const caption = `🎵 *TikTok Audio*\n\n` +
                       `*Autor:* ${data.author || data.nickname || 'Desconocido'}\n` +
                       `*Duración:* ${data.duration || '?'}s\n\n` +
                       `✅ Audio descargado exitosamente`;

        // Enviar el audio como documento
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: 'tiktok_audio.mp3',
            caption: caption
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        
        // Mensaje de error más amigable
        let errorMsg = '❌ Error al descargar el audio.\n\n';
        errorMsg += 'Posibles razones:\n';
        errorMsg += '• El video es privado\n';
        errorMsg += '• El video no tiene audio\n';
        errorMsg += '• El enlace es inválido\n\n';
        errorMsg += '👉 Intenta con otro video';
        
        conn.reply(m.chat, errorMsg, m);
    }
};

handler.help = ['tiktokaudio'].map(v => v + ' <enlace>');
handler.tags = ['descargas'];
handler.command = ['tiktokaudio', 'tta', 'tiktokmp3', 'ttaudio'];
handler.group = true;
handler.register = false;
handler.limit = true;

export default handler;