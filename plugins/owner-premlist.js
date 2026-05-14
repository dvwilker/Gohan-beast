import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const premiumPath = path.resolve(__dirname, "../json/premium.json");
const expPath = path.resolve(__dirname, "../json/premium_exp.json");

let handler = async (m, { conn }) => {
  // ✅ VALIDACIÓN SEGURA DEL OWNER (corregida)
  let ownersList = Array.isArray(global.owner) ? global.owner : [global.owner];
  let cleanOwners = ownersList.map(v => String(v || "").replace(/[^0-9]/g, ""));
  
  if (!cleanOwners.includes(m.sender.split("@")[0])) {
    return conn.reply(m.chat, `🐉 GOHAN BEAST\n⚡ Solo el Saiyajin Supremo puede ver la lista premium.`, m);
  }

  if (!fs.existsSync(premiumPath)) {
    return m.reply("🐉 GOHAN BEAST\n\n⚠️ No hay guerreros premium registrados aún.");
  }

  // ✅ LEER Y VALIDAR premium.json
  let premiumsData = fs.readFileSync(premiumPath, "utf8");
  let premiums = [];
  try {
    premiums = JSON.parse(premiumsData);
    if (!Array.isArray(premiums)) premiums = [];
  } catch (e) {
    premiums = [];
  }

  if (!Array.isArray(premiums) || premiums.length === 0) {
    return m.reply("🐉 GOHAN BEAST\n\n📭 No hay guerreros premium activos en este momento.");
  }

  let expirations = {};
  if (fs.existsSync(expPath)) {
    try {
      let expData = fs.readFileSync(expPath, "utf8");
      expirations = JSON.parse(expData);
      if (typeof expirations !== "object" || expirations === null || Array.isArray(expirations)) {
        expirations = {};
      }
    } catch (e) {
      expirations = {};
    }
  }

  let activos = 0;
  let vencidos = 0;
  let ahora = Date.now();

  let lista = premiums.map((id, i) => {
    let jid = id + "@s.whatsapp.net";
    let exp = expirations[jid];
    let estado = "";

    if (exp) {
      if (exp > ahora) {
        activos++;
        let fecha = new Date(exp).toLocaleString("es-VE", {
          timeZone: "America/Caracas",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
        estado = `⏳ Expira: ${fecha}`;
      } else {
        vencidos++;
        estado = `❌ VENCIDO`;
      }
    } else {
      estado = `⚡ PODER ETERNO`;
    }
    return `┃ ➩ ${i + 1}. @${id} → ${estado}`;
  }).join("\n");

  let total = premiums.length;
  let mensaje = `
🐉 *GOHAN BEAST - GUERREROS PREMIUM* 🐉

${lista}

━━━━━━━━━━━━━━━━━━━━
📊 *ESTADÍSTICAS*
┃ ➩ Total: ${total}
┃ ➩ Activos: ${activos}
┃ ➩ Vencidos: ${vencidos}
━━━━━━━━━━━━━━━━━━━━

⚡ *Que el poder siga fluyendo*
`.trim();

  await conn.reply(m.chat, mensaje, m, { mentions: premiums.map(v => v + "@s.whatsapp.net") });
  await m.react('🐉');
};

handler.help = ["premlist"];
handler.tags = ["owner"];
handler.command = ["premlist", "listaprem", "premiumlist", "premios"];
handler.rowner = true;

export default handler;