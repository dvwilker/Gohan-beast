import axios from 'axios'
import fs from 'fs'
import path from 'path'

// Forzar Node a usar ./tmp para archivos temporales
process.env.TMPDIR = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(process.env.TMPDIR)) {
  fs.mkdirSync(process.env.TMPDIR, { recursive: true })
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `🐉 Ejemplo de uso: ${usedPrefix + command} 𝙶𝙾𝙷𝙰𝙽 𝙱𝙴𝙰𝚂𝚃`, m);
    }
    m.react('🕒');
    let old = new Date();
    let res = await ttks(text);
    let videos = res.data;
    if (!videos.length) {
      return conn.reply(m.chat, "No se encontraron videos.", m);
    }

    let cap = `◜ 𝚃𝙸𝚃𝚄𝙻𝙾 ◞\n\n`
            + `≡ 🎋 𝖳𝗂́𝗍𝗎𝗅𝗈  : ${videos[0].title}\n`
            + `≡ ⚜️ 𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰 : ${text}`

    let medias = videos.map((video, index) => ({
      type: "video",
      data: { url: video.no_wm },
      caption: index === 0
        ? cap
        : `👤 \`Titulo\` : ${video.title}\n🍟 \`Process\` : ${((new Date() - old) * 1)} ms`
    }));

    await conn.sendSylphy(m.chat, medias, { quoted: m });
    m.react('✅');
  } catch (e) {
    return conn.reply(m.chat, `Ocurrió un problema al obtener los videos:\n\n` + e, m);
  }
};

handler.command = ["ttsesearch", "tiktoks", "ttrndm", "tts", "tiktoksearch"];
handler.help = ["tiktoksearch"];
handler.tags = ["search"];
export default handler;

async function ttks(query) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api-gohan.onrender.com/busqueda/tiktok',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      },
      data: {
        keywords: query,
        count: 20,
        cursor: 0,
        HD: 1
      }
    });

    const videos = response.data.data.videos;
    if (videos.length === 0) throw new Error("⚠️ No se encontraron videos para esa búsqueda.");

    const shuffled = videos.sort(() => 0.5 - Math.random()).slice(0, 5);
    return {
      status: true,
      creator: "Made with Ado",
      data: shuffled.map(video => ({
        title: video.title,
        no_wm: video.play,
        watermark: video.wmplay,
        music: video.music
      }))
    };
  } catch (error) {
    throw error;
  }
}