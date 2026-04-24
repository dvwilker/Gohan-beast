import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const handler = async (m, { conn, participants, isOwner, isAdmin }) => {
  // Verificar que sea un sticker
  if (!m.message?.stickerMessage) return;

  // Obtener el hash del sticker
  const fileSha = m.message.stickerMessage.fileSha256?.toString("base64");
  if (!fileSha) return;

  // Leer comandos.json
  const jsonPath = path.resolve(__dirname, "../comandos.json");
  if (!fs.existsSync(jsonPath)) return;

  const comandos = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const comando = comandos[fileSha];
  if (!comando) return;

  // Ejecutar el comando asociado
  console.log(`🎯 Sticker ejecuta comando: ${comando}`);

  switch (comando.toLowerCase()) {
    case "kick":
      // Verificar que responda a un mensaje
      if (!m.message?.stickerMessage?.contextInfo?.quotedMessage) {
        return conn.reply(m.chat, "🗡️ *Responde al mensaje de la persona que quieres expulsar con este sticker*", m);
      }

      const usuarioExpulsar = m.message.stickerMessage.contextInfo.participant;
      if (!usuarioExpulsar) {
        return conn.reply(m.chat, "❌ No se pudo identificar al usuario.", m);
      }

      // Verificar que el bot sea admin
      const bot = participants.find(v => v.id == conn.user.jid);
      if (!bot?.admin) {
        return conn.reply(m.chat, "⚡ Necesito ser administrador para expulsar.", m);
      }

      // Verificar que el usuario no sea admin
      const usuarioEnGrupo = participants.find(v => v.id === usuarioExpulsar);
      if (!usuarioEnGrupo) {
        return conn.reply(m.chat, "❌ El usuario ya no está en el grupo.", m);
      }

      if (usuarioEnGrupo.admin) {
        return conn.reply(m.chat, "❌ No puedo expulsar a un administrador.", m);
      }

      await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], "remove");
      await conn.reply(m.chat, `🗡️ *${usuarioExpulsar.split("@")[0]} ha sido expulsado por el poder del sticker*`, m);
      break;

    case "tag":
    case "invocar":
    case "mencionartodos":
      const mentions = participants.map(a => a.id);
      await conn.sendMessage(m.chat, {
        text: `⚡ *INVOCACIÓN DIVINA POR STICKER* ⚡\n\n¡El poder ha sido liberado!\n\n👥 *Guerreros:* ${mentions.length}`,
        mentions: mentions
      }, { quoted: m });
      break;

    default:
      await conn.reply(m.chat, `⚡ *Comando ejecutado:* ${comando}\n\n(Para que funcione, el comando debe estar programado)`, m);
  }
};

handler.customPrefix = /.*/;
handler.command = new RegExp();

export default handler;