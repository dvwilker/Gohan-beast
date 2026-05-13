import fs from 'fs';
import path from 'path';

// Rutas a los archivos
const premsPath = path.join('./json/premium.json');
const expPath = path.join('./json/premium_exp.json');

// Función para cargar JSON de forma segura
function loadJSON(file, defaultValue) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
        return defaultValue;
    }
}

// Cargar datos iniciales
let prems = loadJSON(premsPath, []);
let premiumExp = loadJSON(expPath, {});

// Guardar cambios
function saveFiles() {
    fs.writeFileSync(premsPath, JSON.stringify(prems, null, 2));
    fs.writeFileSync(expPath, JSON.stringify(premiumExp, null, 2));
}

// Verificar si un usuario es premium
export function isPremium(userId) {
    const num = userId.split('@')[0];
    if (!prems.includes(num)) return false;
    
    const userJid = num + '@s.whatsapp.net';
    const expire = premiumExp[userJid] || 0;
    
    if (Date.now() > expire) {
        // Limpiar expirado
        prems = prems.filter(n => n !== num);
        delete premiumExp[userJid];
        saveFiles();
        return false;
    }
    
    return true;
}

// Agregar premium
export function addPremium(userId, days, owner = 'system') {
    const num = userId.split('@')[0];
    const userJid = num + '@s.whatsapp.net';
    const expireDate = Date.now() + (days * 24 * 60 * 60 * 1000);
    
    if (!prems.includes(num)) {
        prems.push(num);
    }
    
    premiumExp[userJid] = expireDate;
    saveFiles();
    
    return { num, expireDate };
}

// Quitar premium
export function removePremium(userId) {
    const num = userId.split('@')[0];
    const userJid = num + '@s.whatsapp.net';
    
    if (prems.includes(num)) {
        prems = prems.filter(n => n !== num);
        delete premiumExp[userJid];
        saveFiles();
        return true;
    }
    return false;
}

// Obtener info premium
export function getPremiumInfo(userId) {
    const num = userId.split('@')[0];
    if (!prems.includes(num)) return null;
    
    const userJid = num + '@s.whatsapp.net';
    const expire = premiumExp[userJid] || 0;
    
    if (Date.now() > expire) {
        removePremium(userId);
        return null;
    }
    
    const remaining = expire - Date.now();
    const remainingDays = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    
    return {
        userId: num,
        remainingDays: remainingDays,
        expireDate: new Date(expire).toLocaleString(),
        isActive: true
    };
}

// Listar todos los premium activos
export function listPremiumUsers() {
    const activos = [];
    const now = Date.now();
    
    for (const num of prems) {
        const userJid = num + '@s.whatsapp.net';
        const expire = premiumExp[userJid] || 0;
        
        if (expire > now) {
            const remainingDays = Math.ceil((expire - now) / (24 * 60 * 60 * 1000));
            activos.push({
                userId: num,
                remainingDays: remainingDays,
                expireDate: new Date(expire).toLocaleString()
            });
        } else {
            // Limpiar expirado
            removePremium(userJid);
        }
    }
    
    return activos;
}

export default { isPremium, addPremium, removePremium, getPremiumInfo, listPremiumUsers };