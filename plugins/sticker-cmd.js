import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const handler = async (m, { conn, participants, isOwner, isAdmin }) => {
  if (!m.message?.stickerMessage) return;

  // Obtener el hash del sticker en formato números (como se guarda)
  const fileShaBuffer = m.message.stickerMessage.fileSha256;
  if (!fileShaBuffer) return;

  const hashArray = [];
  for (let i = 0; i < fileShaBuffer.length; i++) {
    hashArray.push(fileShaBuffer[i]);
  }
  const fileSha = hashArray.join(",");

  const jsonPath = path.resolve(__dirname, "../comandos.json");
  if (!fs.existsSync(jsonPath)) return;

  const comandos = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const comando = comandos[fileSha];
  if (!comando) return;

  console.log(`🎯 Sticker ejecuta comando: ${comando}`);

  if (comando.toLowerCase() === "kick") {
    const quotedMsg = m.message.stickerMessage.contextInfo;
    if (!quotedMsg?.quotedMessage) {
      return conn.reply(m.chat, "🗡️ *Responde al mensaje de la persona que quieres expulsar con este sticker*", m);
    }

    const usuarioExpulsar = quotedMsg.participant;
    if (!usuarioExpulsar) {
      return conn.reply(m.chat, "❌ No se pudo identificar al usuario.", m);
    }

    const bot = participants.find(v => v.id == conn.user.jid);
    if (!bot?.admin) {
      return conn.reply(m.chat, "⚡ Necesito ser administrador para expulsar.", m);
    }

    const usuarioEnGrupo = participants.find(v => v.id === usuarioExpulsar);
    if (!usuarioEnGrupo) {
      return conn.reply(m.chat, "❌ El usuario ya no está en el grupo.", m);
    }

    if (usuarioEnGrupo.admin) {
      return conn.reply(m.chat, "❌ No puedo expulsar a un administrador.", m);
    }

    await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], "remove");
    await conn.reply(m.chat, `🗡️ *@${usuarioExpulsar.split("@")[0]} ha sido expulsado por el poder del sticker*`, m, { mentions: [usuarioExpulsar] });
  }
};

handler.customPrefix = /.*/;
handler.command = new RegExp();

export default handler;