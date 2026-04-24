import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ Patrón seguro para extraer solo números
const DIGITS = (s = "") => String(s || "").replace(/[^0-9]/g, "");

/** Verifica admin por NÚMERO usando la lógica robusta (LID y no-LID) */
async function isAdminByNumber(conn, chatId, number) {
  try {
    const meta = await conn.groupMetadata(chatId);
    const rawParts = Array.isArray(meta?.participants) ? meta.participants : [];

    const adminNums = new Set();
    for (let i = 0; i < rawParts.length; i++) {
      let p = rawParts[i];
      let flagAdmin = p.admin === "admin" || p.admin === "superadmin";
      if (!flagAdmin) continue;

      let pid  = String(p.id  || "");
      let pjid = String(p.jid || "");

      // 1) Extracción directa de @s.whatsapp.net
      if (pid.endsWith("@s.whatsapp.net")) adminNums.add(pid.split(":")[0].replace(/[^0-9]/g, ""));
      if (pjid.endsWith("@s.whatsapp.net")) adminNums.add(pjid.split(":")[0].replace(/[^0-9]/g, ""));

      // 2) Resolución a través del lidMap
      if (pid.endsWith("@lid") && global.lidMap instanceof Map) {
        let resolved = global.lidMap.get(pid);
        if (resolved && resolved.endsWith("@s.whatsapp.net")) adminNums.add(resolved.split(":")[0].replace(/[^0-9]/g, ""));
      }
      if (pjid.endsWith("@lid") && global.lidMap instanceof Map) {
        let resolved2 = global.lidMap.get(pjid);
        if (resolved2 && resolved2.endsWith("@s.whatsapp.net")) adminNums.add(resolved2.split(":")[0].replace(/[^0-9]/g, ""));
      }

      // 3) Fallback usando conn.lidParser (si existe)
      if (typeof conn.lidParser === "function") {
        let normed = conn.lidParser([p]);
        if (normed && normed[0]) {
          let nid = String(normed[0].id || "");
          if (nid.endsWith("@s.whatsapp.net")) adminNums.add(nid.split(":")[0].replace(/[^0-9]/g, ""));
        }
      }
    }
    return adminNums.has(number);
  } catch (e) {
    console.error("[addco] Error reading admins:", e);
    return false;
  }
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  // ✅ Obtener senderNum de forma robusta
  const senderId = msg.realJid || msg.key.participant || msg.key.remoteJid;
  const senderNum = String(msg.realNumber || DIGITS(senderId.split(":")[0]));

  const isFromMe = !!msg.key.fromMe;

  // Owners desde owner.json (fallback a global.owner) + validación robusta
  const ownerPath = path.resolve(__dirname, "owner.json");
  let owners = [];
  try { owners = JSON.parse(fs.readFileSync(ownerPath, "utf-8")); }
  catch { owners = global.owner || []; }

  const isOwner = Array.isArray(owners) && owners.some(function(entry) {
    let n = Array.isArray(entry) ? entry[0] : entry;
    return String(n).replace(/[^0-9]/g, "") === senderNum;
  });

  // Verificación de permisos robusta
  let isAdmin = false;
  if (isGroup) {
    isAdmin = await isAdminByNumber(conn, chatId, senderNum);
  }

  if (!isAdmin && !isOwner && !isFromMe) {
    const errorText = isGroup 
      ? "🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*"
      : "🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*";

    return conn.sendMessage(chatId, { text: errorText }, { quoted: msg });
  }

  // Verifica que se responda a un sticker
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.stickerMessage) {
    return conn.sendMessage(chatId, {
      text: "❌ *Responde a un sticker para asignarle un comando.*"
    }, { quoted: msg });
  }

  const comando = args.join(" ").trim();
  if (!comando) {
    return conn.sendMessage(chatId, {
      text: "⚠️ *Especifica el comando a asignar. Ejemplo:* addco kick"
    }, { quoted: msg });
  }

  const fileSha = quoted.stickerMessage.fileSha256?.toString("base64");
  if (!fileSha) {
    return conn.sendMessage(chatId, {
      text: "❌ *No se pudo obtener el ID único del sticker.*"
    }, { quoted: msg });
  }

  const jsonPath = path.resolve(__dirname, "./comandos.json");
  const data = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf-8"))
    : {};

  data[fileSha] = comando;
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });

  return conn.sendMessage(chatId, {
    text: `✅ *Sticker vinculado al comando con éxito:* \`${comando}\``,
    quoted: msg
  });
};

handler.command = ["addco"];
handler.tags = ["tools"];
handler.help = ["addco <comando>"];

export default handler;