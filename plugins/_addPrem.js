import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const premiumFile = path.resolve(__dirname, "../json/premium.json");
const expFile = path.resolve(__dirname, "../json/premium_exp.json");

function readJSON(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    let data = fs.readFileSync(file);
    return JSON.parse(data.toString() || JSON.stringify(def));
  } catch {
    return def;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // ✅ VALIDACIÓN SEGURA DEL OWNER (corregida)
  let ownersList = Array.isArray(global.owner) ? global.owner : [global.owner];
  let cleanOwners = ownersList.map(v => String(v || "").replace(/[^0-9]/g, ""));
  
  if (!cleanOwners.includes(m.sender.split("@")[0])) {
    return conn.reply(m.chat, `🐉 GOHAN BEAST\n⚡ Solo el owner puede otorgar poder premium.`, m);
  }

  let numero = args[0]?.replace(/[@+]/g, "");
  let dias = parseInt(args[1]);

  if (!numero || isNaN(dias) || dias <= 0) {
    return conn.reply(m.chat, `🐉 GOHAN BEAST\n📌 Uso: ${usedPrefix + command} <número> <días>\n📌 Ejemplo: ${usedPrefix + command} 584125877491 30`, m);
  }

  let userJid = numero + "@s.whatsapp.net";
  let time = dias * 24 * 60 * 60 * 1000;
  let expireAt = Date.now() + time;
  let fechaExpiracion = new Date(expireAt).toLocaleDateString('es-VE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let premium = readJSON(premiumFile, []);
  let premiumExp = readJSON(expFile, {});

  if (!premium.includes(numero)) {
    premium.push(numero);
  }

  premiumExp[userJid] = expireAt;

  saveJSON(premiumFile, premium);
  saveJSON(expFile, premiumExp);

  await conn.reply(m.chat, `🐉 GOHAN BEAST\n\n✅ ${numero} ahora es premium por ${dias} días\n📅 Expira: ${fechaExpiracion}`, m, { mentions: [userJid] });

  await m.react('🐉');
  await m.react('⚡');
};

handler.help = ["addprem"];
handler.tags = ["owner"];
handler.command = ["addprem", "+prem", "darprem", "otorgarprem"];
handler.rowner = true;

export default handler;